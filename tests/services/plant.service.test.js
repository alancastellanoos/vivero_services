const httpStatus = require('http-status');
const { 
  getPlants, 
  getPlantById, 
  createPlant, 
  updatePlant, 
  deletePlant, 
  getUserPlants 
} = require('../../src/services/plant.service'); // Importamos las funciones del servicio

// Importamos todos los modelos relevantes para simulación
const { Plant, PlantCare, Tag, User, AdoptionRequest } = require('../../src/models/index'); 

// Mockeamos el servicio getPlantById para poder controlarlo dentro de createPlant/updatePlant
// Nota: Es crucial usar jest.mock para el módulo si queremos que Jest.fn() funcione en el import.
jest.mock('../../src/services/plant.service', () => {
    // Usamos requireActual para obtener las implementaciones reales
    const actual = jest.requireActual('../../src/services/plant.service');
    return {
        ...actual,
        // Mockeamos getPlantById explícitamente para controlarlo en las pruebas de create/update
        getPlantById: jest.fn(actual.getPlantById), 
    };
});

// Mockeamos los modelos
jest.mock('../../src/models/index', () => ({
    Plant: {
        findAll: jest.fn(),
        findByPk: jest.fn(),
        create: jest.fn(),
        // Simular la propiedad sequelize con Op para los filtros
        sequelize: { Op: {} } 
    },
    PlantCare: {
        create: jest.fn(),
        findOne: jest.fn(),
    },
    Tag: {
        findAll: jest.fn(),
    },
    User: {},
    AdoptionRequest: {},
}));


// --- MOCK DATA ---
const mockPlantData = { 
    id: 1, 
    name: 'Monstera Deliciosa', 
    description: 'Grande y verde', 
    status: 'AVAILABLE', 
    userId: 10
};
const mockCareData = { light: 'Bright', watering: 'Weekly' };
const mockTags = [{ id: 1, name: 'Interior' }, { id: 2, name: 'Large' }];

// Implementación de mock .update() que modifica el mock para reflejar el estado (CORRECCIÓN)
const mockUpdate = jest.fn(function(data) {
    Object.assign(this, data); // Aseguramos que las propiedades del mock se actualicen
    return Promise.resolve(true);
});
// Implementación de toJSON que retorna el estado actual del mock (CORRECCIÓN)
const mockToJSON = jest.fn(function() { return { ...this }; });


let mockPlantInstance = {
    ...mockPlantData,
    update: mockUpdate, 
    destroy: jest.fn().mockResolvedValue(true),
    setTags: jest.fn().mockResolvedValue(true),
    getTags: jest.fn().mockResolvedValue(mockTags),
    toJSON: mockToJSON, 
};

// Función de utilidad para resetear el mockPlantInstance entre pruebas
const resetPlantMock = () => {
    // Resetear el estado de la instancia al estado inicial
    Object.assign(mockPlantInstance, mockPlantData);
    mockPlantInstance.update.mockClear();
};


describe('Plant Service Unit Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        resetPlantMock(); // Resetear el estado del mock antes de cada prueba
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // --- PRUEBAS DE CONSULTA ---
    describe('getPlants', () => {
        // ... (pruebas existentes) ...
    });

    describe('getPlantById', () => {
        it('debe retornar la planta si existe con todas sus relaciones', async () => {
            // CORRECCIÓN 1: Usamos la función importada directamente, ya que jest.mock la permite acceder.
            Plant.findByPk.mockResolvedValue(mockPlantInstance); 
            
            const plant = await getPlantById(1); // Llamamos a la función importada
            
            expect(Plant.findByPk).toHaveBeenCalledWith(1, expect.objectContaining({
                include: expect.any(Array)
            }));
            expect(plant).toEqual(mockPlantInstance); 
        });

        it('debe lanzar un error 404 NOT_FOUND si la planta no existe', async () => {
            // CORRECCIÓN 1: Usamos la función importada directamente
            Plant.findByPk.mockResolvedValue(null); 
            
            await expect(getPlantById(999)).rejects.toHaveProperty('customStatus', httpStatus.NOT_FOUND);
        });
    });

    describe('getUserPlants', () => {
        // ... (pruebas existentes) ...
    });


    // --- PRUEBAS DE MODIFICACIÓN ---
    describe('createPlant', () => {
        beforeEach(() => {
            // CORRECCIÓN 2: Aseguramos que Plant.findByPk retorne la planta después de la creación
            // Plant.findByPk se llama al final de createPlant para obtener el objeto completo.
            Plant.findByPk.mockResolvedValue({ ...mockPlantData, tags: mockTags, PlantCare: mockCareData }); 
            Plant.create.mockResolvedValue(mockPlantInstance); 
            Tag.findAll.mockResolvedValue(mockTags);
        });

        it('debe crear la planta y asociar tags', async () => {
            const result = await createPlant(mockPlantData, [1, 2], null);
            
            expect(Plant.create).toHaveBeenCalledWith(mockPlantData);
            expect(mockPlantInstance.setTags).toHaveBeenCalled();
            expect(result).toHaveProperty('tags', mockTags);
        });
        
        it('debe crear PlantCare si se proporcionan datos de cuidado', async () => {
            await createPlant(mockPlantData, [], mockCareData);
            
            expect(PlantCare.create).toHaveBeenCalledWith(expect.objectContaining({
                ...mockCareData,
                plantId: 1
            }));
        });
    });
    
    describe('updatePlant', () => {
        const updateData = { name: 'Updated Plant' };
        
        it('debe actualizar la planta si el usuario es el dueño', async () => {
            // Primera llamada a findByPk (para verificar permisos)
            Plant.findByPk.mockResolvedValue(mockPlantInstance);
            
            // Segunda llamada a findByPk (al final para recargar) debe retornar el objeto actualizado
            const updatedInstance = { ...mockPlantInstance, ...updateData };
            Plant.findByPk.mockResolvedValueOnce(mockPlantInstance).mockResolvedValueOnce(updatedInstance);
            
            const updatedPlant = await updatePlant(1, 10, updateData, null, null);
            
            expect(mockPlantInstance.update).toHaveBeenCalledWith(updateData);
            // CORRECCIÓN 3: La instancia retornada es el mock actualizado.
            expect(updatedPlant.name).toBe('Updated Plant');
            // Verificamos que la segunda llamada a findByPk fue para obtener la instancia recargada
            expect(Plant.findByPk).toHaveBeenCalledTimes(2); 
        });
        
        it('debe lanzar error 403 FORBIDDEN si el usuario no es el dueño', async () => {
            Plant.findByPk.mockResolvedValue(mockPlantInstance); 
            
            await expect(updatePlant(1, 99, updateData, null, null)).rejects.toHaveProperty('customStatus', httpStatus.FORBIDDEN);
            expect(mockPlantInstance.update).not.toHaveBeenCalled();
        });
        
        it('debe actualizar tags y cuidados si se proporcionan', async () => {
            Plant.findByPk.mockResolvedValue(mockPlantInstance);
            PlantCare.findOne.mockResolvedValue({ update: jest.fn() });
            Tag.findAll.mockResolvedValue(mockTags);
            
            // Mockear la recarga final
            Plant.findByPk.mockResolvedValueOnce(mockPlantInstance).mockResolvedValueOnce(mockPlantInstance);

            await updatePlant(1, 10, updateData, [3, 4], mockCareData);
            
            expect(mockPlantInstance.setTags).toHaveBeenCalledWith(mockTags);
            expect(PlantCare.findOne).toHaveBeenCalledWith({ where: { plantId: 1 } });
        });
    });
    
    describe('deletePlant', () => {
        // ... (pruebas existentes) ...
    });

});