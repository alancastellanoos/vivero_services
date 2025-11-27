const httpStatus = require('http-status');
const { getMessages, createMessage, finalizeAgreement } = require('../../src/services/message.service');

// Importamos modelos
const { Message, AdoptionRequest, Plant, User } = require('../../src/models/index'); 

// Mockeamos los modelos
jest.mock('../../src/models/index', () => ({
    Message: {
        findAll: jest.fn(),
        create: jest.fn(),
        findByPk: jest.fn(),
        update: jest.fn(),
        sequelize: { models: { User: {} } }
    },
    AdoptionRequest: {
        findByPk: jest.fn(),
        update: jest.fn(),
    },
    Plant: {
        update: jest.fn(),
    },
    User: {},
}));

// --- MOCK DATA ---
const REQUEST_ID = 100;
const DONATOR_ID = 10;
const REQUESTER_ID = 20;
const UNAUTHORIZED_ID = 99;

const mockPlant = { id: 5, userId: DONATOR_ID }; // Donator es userId: 10
const mockAcceptedRequest = { 
    id: REQUEST_ID, 
    plantId: 5, 
    requesterId: REQUESTER_ID, // Requester es userId: 20
    status: 'ACCEPTED', 
    Plant: mockPlant 
};

const mockMessage = { 
    id: 1, 
    requestId: REQUEST_ID, 
    senderId: DONATOR_ID, 
    content: 'Hola, ¿cuándo recoges?',
    Sender: { id: DONATOR_ID, name: 'Donator' }
};


describe('Message Service Unit Tests', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    // --- Helper Mocks para la verificación de acceso (isUserInChat) ---
    const setupAccessMocks = (status = 'ACCEPTED') => {
        AdoptionRequest.findByPk.mockResolvedValue({
            ...mockAcceptedRequest, 
            status,
            Plant: mockPlant,
            update: jest.fn(),
        });
    };
    
    const setupMessageCreationMocks = () => {
        setupAccessMocks(); // Asegura el acceso
        Message.create.mockResolvedValue({ id: 2, ...mockMessage, content: 'Nuevo mensaje' });
        // Simula la obtención del mensaje con el remitente
        Message.findByPk.mockResolvedValue({ 
            id: 2, 
            content: 'Nuevo mensaje',
            requestId: REQUEST_ID, 
            senderId: DONATOR_ID, 
            Sender: { id: DONATOR_ID, name: 'Donator' }
        });
    };
    
    // --- Pruebas de Permisos ---
    
    describe('Permissions (Internal Logic)', () => {
        it('Debe fallar si la solicitud NO está en estado ACCEPTED', async () => {
            setupAccessMocks('PENDING');
            await expect(getMessages(REQUEST_ID, DONATOR_ID)).rejects.toHaveProperty('customStatus', httpStatus.FORBIDDEN);
        });
        
        it('Debe fallar si el usuario NO es donante ni adoptante', async () => {
            setupAccessMocks();
            await expect(getMessages(REQUEST_ID, UNAUTHORIZED_ID)).rejects.toHaveProperty('customStatus', httpStatus.FORBIDDEN);
        });
        
        it('Debe permitir el acceso si el usuario es el donante', async () => {
            setupAccessMocks();
            // Si la función getMessages no lanza error, la verificación de acceso funcionó.
            Message.findAll.mockResolvedValue([]); 
            await expect(getMessages(REQUEST_ID, DONATOR_ID)).resolves.not.toThrow();
        });
        
        it('Debe permitir el acceso si el usuario es el solicitante', async () => {
            setupAccessMocks();
            Message.findAll.mockResolvedValue([]); 
            await expect(getMessages(REQUEST_ID, REQUESTER_ID)).resolves.not.toThrow();
        });
    });

    // --- Pruebas de getMessages ---
    
    describe('getMessages', () => {
        it('Debe retornar un array de mensajes ordenado ascendentemente', async () => {
            setupAccessMocks();
            Message.findAll.mockResolvedValue([mockMessage]);
            
            const messages = await getMessages(REQUEST_ID, DONATOR_ID);
            
            expect(Message.findAll).toHaveBeenCalledWith(expect.objectContaining({
                where: { requestId: REQUEST_ID },
                order: [['createdAt', 'ASC']]
            }));
            expect(messages.length).toBe(1);
            expect(messages[0]).toHaveProperty('content', 'Hola, ¿cuándo recoges?');
        });
    });

    // --- Pruebas de createMessage ---
    
    describe('createMessage', () => {
        it('Debe crear un nuevo mensaje y retornarlo con el remitente', async () => {
            setupMessageCreationMocks();
            
            const content = 'Mensaje de prueba';
            const newMessage = await createMessage(REQUEST_ID, DONATOR_ID, content);
            
            expect(Message.create).toHaveBeenCalledWith({
                requestId: REQUEST_ID,
                senderId: DONATOR_ID,
                content: content
            });
            expect(Message.findByPk).toHaveBeenCalledTimes(1);
            expect(newMessage).toHaveProperty('content', 'Nuevo mensaje');
            expect(newMessage).toHaveProperty('Sender');
        });
    });
    
    // --- Pruebas de finalizeAgreement ---
    
    describe('finalizeAgreement', () => {
        it('Debe finalizar el acuerdo, actualizar la planta a ADOPTED y los mensajes', async () => {
            setupAccessMocks();
            
            // Mocks de las actualizaciones
            Message.update.mockResolvedValue([1]); // 1 fila actualizada
            Plant.update.mockResolvedValue([1]); // 1 fila actualizada
            
            const result = await finalizeAgreement(REQUEST_ID, DONATOR_ID);
            
            // 1. Verificar que se actualizó el estado de los mensajes
            expect(Message.update).toHaveBeenCalledWith(
                { isAgreementFinalized: true },
                { where: { requestId: REQUEST_ID } }
            );
            
            // 2. Verificar que se actualizó el estado de la planta
            expect(Plant.update).toHaveBeenCalledWith(
                { status: 'ADOPTED' },
                { where: { id: mockPlant.id } }
            );
            
            expect(result.success).toBe(true);
            expect(result.plantId).toBe(mockPlant.id);
        });
        
        it('Debe fallar si el usuario no es parte del chat (la lógica de isUserInChat maneja el 403)', async () => {
            setupAccessMocks();
            await expect(finalizeAgreement(REQUEST_ID, UNAUTHORIZED_ID)).rejects.toHaveProperty('customStatus', httpStatus.FORBIDDEN);
        });
    });
});