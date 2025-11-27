const httpStatus = require('http-status');
const { 
  createAdoptionRequest, 
  getIncomingRequests, 
  acceptRequest, 
  rejectRequest 
} = require('../../src/services/request.service');

// Importamos modelos
const { AdoptionRequest, Plant, User } = require('../../src/models/index'); 

// Mockeamos los modelos (Plant y AdoptionRequest)
jest.mock('../../src/models/index', () => ({
    Plant: {
        findByPk: jest.fn(),
        findAll: jest.fn(),
        sequelize: { Op: {} }
    },
    AdoptionRequest: {
        create: jest.fn(),
        findOne: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
        findByPk: jest.fn(),
        sequelize: { Op: {} }
    },
    User: {},
}));

// --- MOCK DATA ---
const mockPlant = { id: 5, status: 'AVAILABLE', userId: 10, update: jest.fn() }; // Dueño: 10
const mockRequestData = { plantId: 5, requesterId: 20, message: 'Me interesa', status: 'PENDING' };

// Creamos un mock con una función update que simula la actualización del estado (CORRECCIÓN)
let mockRequestInstance = { 
    id: 1, 
    ...mockRequestData, 
    Plant: mockPlant,
    // La función update mockeada DEBE cambiar el valor 'status' en el mock
    update: jest.fn(function(data) {
        if (data && data.status) {
            this.status = data.status; // Actualiza la propiedad 'status' del mock
        }
        return Promise.resolve(true);
    }),
};

// Función auxiliar para resetear la instancia entre pruebas
const resetMockRequestInstance = () => {
    mockRequestInstance.status = 'PENDING';
    mockRequestInstance.Plant = mockPlant;
    mockRequestInstance.update.mockClear();
    mockPlant.update.mockClear();
};


describe('AdoptionRequest Service Unit Tests', () => {

    beforeEach(() => {
        resetMockRequestInstance(); // Aseguramos que el estado sea 'PENDING' antes de cada test
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // --- PRUEBAS DE CREACIÓN ---
    describe('createAdoptionRequest', () => {
        it('debe crear una solicitud si la planta está disponible', async () => {
            Plant.findByPk.mockResolvedValue(mockPlant);
            AdoptionRequest.findOne.mockResolvedValue(null);
            AdoptionRequest.create.mockResolvedValue(mockRequestInstance);
            
            const request = await createAdoptionRequest(5, 20, 'Hola');
            
            expect(AdoptionRequest.create).toHaveBeenCalledWith(expect.objectContaining({ 
                plantId: 5, 
                requesterId: 20 
            }));
            expect(request).toEqual(mockRequestInstance);
        });

        it('debe lanzar error 400 si la planta no está disponible', async () => {
            Plant.findByPk.mockResolvedValue({ id: 5, status: 'ADOPTED' });
            
            await expect(createAdoptionRequest(5, 20, 'Hola')).rejects.toHaveProperty('customStatus', httpStatus.BAD_REQUEST);
        });
        
        it('debe lanzar error 409 CONFLICT si ya existe una solicitud del mismo usuario para la planta', async () => {
            Plant.findByPk.mockResolvedValue(mockPlant);
            AdoptionRequest.findOne.mockResolvedValue(mockRequestInstance);
            
            await expect(createAdoptionRequest(5, 20, 'Hola')).rejects.toHaveProperty('customStatus', httpStatus.CONFLICT);
        });
    });
    
    // --- PRUEBAS DE CONSULTA ---
    describe('getIncomingRequests', () => {
        it('debe obtener las solicitudes pendientes para las plantas del donante', async () => {
            Plant.findAll.mockResolvedValue([{ id: 5 }, { id: 6 }]); // Plantas del donante
            AdoptionRequest.findAll.mockResolvedValue([mockRequestInstance]);

            const requests = await getIncomingRequests(10); // Donante ID 10

            expect(Plant.findAll).toHaveBeenCalledWith({ where: { userId: 10 }, attributes: ['id', 'name'] });
            expect(AdoptionRequest.findAll).toHaveBeenCalledWith(expect.objectContaining({
                where: { plantId: [5, 6], status: 'PENDING' }
            }));
            expect(requests.length).toBe(1);
        });
    });

    // --- PRUEBAS DE GESTIÓN DE ESTADO ---
    describe('acceptRequest', () => {
        it('debe aceptar la solicitud, cambiar el status de la planta y rechazar otras', async () => {
            mockPlant.update.mockResolvedValue(true);
            AdoptionRequest.findByPk.mockResolvedValue(mockRequestInstance);

            const result = await acceptRequest(1, 10); // Donante ID 10

            expect(mockRequestInstance.update).toHaveBeenCalledWith({ status: 'ACCEPTED' });
            expect(mockPlant.update).toHaveBeenCalledWith({ status: 'PENDING_AGREEMENT' });
            expect(AdoptionRequest.update).toHaveBeenCalledTimes(1); 
            // CORRECCIÓN: Ahora el status es 'ACCEPTED' porque el mock de update lo modificó
            expect(result.status).toBe('ACCEPTED'); 
        });

        it('debe lanzar error 403 FORBIDDEN si el usuario no es el donante', async () => {
            AdoptionRequest.findByPk.mockResolvedValue(mockRequestInstance); // Donante ID 10
            
            await expect(acceptRequest(1, 99)).rejects.toHaveProperty('customStatus', httpStatus.FORBIDDEN);
        });
    });

    describe('rejectRequest', () => {
        it('debe rechazar la solicitud si el usuario es el donante', async () => {
            AdoptionRequest.findByPk.mockResolvedValue(mockRequestInstance);

            const result = await rejectRequest(1, 10);

            expect(mockRequestInstance.update).toHaveBeenCalledWith({ status: 'REJECTED' });
            expect(result.status).toBe('REJECTED'); // Verificamos el estado actualizado
        });
        
        it('debe lanzar error 400 BAD_REQUEST si la solicitud ya fue procesada', async () => {
            // Seteamos el estado del mock a ACCEPTED (procesado) para esta prueba
            mockRequestInstance.status = 'ACCEPTED'; 
            AdoptionRequest.findByPk.mockResolvedValue(mockRequestInstance);
            
            await expect(rejectRequest(1, 10)).rejects.toHaveProperty('customStatus', httpStatus.BAD_REQUEST);
        });
    });

});