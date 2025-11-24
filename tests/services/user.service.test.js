const httpStatus = require('http-status'); 


const User = require('../../src/models/user.model'); 
const { 
  getUsers, 
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../../src/services/user.service');

jest.mock('../../src/models/user.model');



const mockUserData = { id: 1, name: 'Test User', email: 'test@mail.com', password: 'hashedpassword' };
const mockUserInstance = {
    ...mockUserData,
    update: jest.fn().mockResolvedValue(true),

    toJSON: jest.fn().mockReturnValue(mockUserData), 
};
const mockUserResponse = { id: 1, name: 'Test User', email: 'test@mail.com' }; 

describe('User Service Unit Tests', () => {


    afterEach(() => {
        jest.clearAllMocks();
    });


    describe('getUsers', () => {
        it('debe retornar un array de usuarios excluyendo la contraseña', async () => {
            User.findAll.mockResolvedValue([mockUserInstance, mockUserInstance]);
            
            const users = await getUsers();
            
            expect(User.findAll).toHaveBeenCalledWith({ attributes: { exclude: ['password'] } });
            expect(users.length).toBe(2); 
        });
    });


    describe('getUserById', () => {
        it('debe retornar el usuario si existe', async () => {

            User.findByPk.mockResolvedValue(mockUserInstance); 
            
            const user = await getUserById(1);
            
            expect(User.findByPk).toHaveBeenCalledWith(1, expect.anything());
           
            expect(user).toEqual(mockUserInstance); 
        });

        it('debe lanzar un error 404 NOT_FOUND si el usuario no existe', async () => {
            User.findByPk.mockResolvedValue(null); 
            
            await expect(getUserById(999)).rejects.toHaveProperty('customStatus', httpStatus.NOT_FOUND);
        });
    });


    describe('createUser', () => {
        it('debe crear un nuevo usuario y retornar la respuesta sin password', async () => {
           
            User.create.mockResolvedValue({
                ...mockUserInstance, 
                toJSON: jest.fn().mockReturnValue(mockUserData) 
            });
            
            const newUser = await createUser(mockUserData);
            
            expect(User.create).toHaveBeenCalledWith(mockUserData);
            expect(newUser).toEqual(mockUserResponse); 
        });
    });

    
    describe('updateUser', () => {
        it('debe actualizar el usuario si existe y retornar la respuesta sin password', async () => {
            const updatedData = { name: 'Updated Name' };
            
          
            User.findByPk.mockResolvedValue({
                ...mockUserInstance, 
                update: jest.fn().mockResolvedValue(true),
                toJSON: jest.fn().mockReturnValue({...mockUserData, ...updatedData})
            });

            const updatedUser = await updateUser(1, updatedData);
            
            expect(User.findByPk).toHaveBeenCalledWith(1);
            expect(updatedUser.name).toBe('Updated Name');
            expect(updatedUser).not.toHaveProperty('password'); 
        });
        
        it('debe lanzar un error 404 NOT_FOUND si el usuario a actualizar no existe', async () => {
            User.findByPk.mockResolvedValue(null); 
            
            await expect(updateUser(999, { name: 'New Name' })).rejects.toHaveProperty('customStatus', httpStatus.NOT_FOUND);
        });
    });

 
    describe('deleteUser', () => {
        it('debe eliminar el usuario y no retornar nada', async () => {

            User.destroy.mockResolvedValue(1); 
            
            await expect(deleteUser(1)).resolves.not.toThrow();
            expect(User.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
        });
        
        it('debe lanzar un error 404 NOT_FOUND si el usuario a eliminar no existe', async () => {

            User.destroy.mockResolvedValue(0); 
            
            await expect(deleteUser(999)).rejects.toHaveProperty('customStatus', httpStatus.NOT_FOUND);
        });
    });

});