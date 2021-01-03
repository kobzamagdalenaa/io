import React from 'react'
import { act } from 'react-dom/test-utils'
import renderer from 'react-test-renderer'
import Enzyme, { mount } from 'enzyme'
import Adapter from '@wojtekmaj/enzyme-adapter-react-17'

import { db } from '../db';
import SignUpForm, { register } from './signup'

jest.mock('../db');
Enzyme.configure({ adapter: new Adapter() })

// describe('<SingUpForm />', () => {
//   beforeEach(() => {
//     window.alert = jest.fn()
//   })

//   afterEach(() => {
//     jest.clearAllMocks()
//     window.alert.mockClear()
//   })

//   it('Renders sign up form with initial values', () => {
//     const tree = renderer.create(<SignUpForm />).toJSON()
//     expect(tree).toMatchSnapshot()
//   })

  // it('Renders sign up form with user input values', () => {
  //   const preventDefaultMock = jest.fn()
  //   const eventMock = { preventDefault: preventDefaultMock }
  //   const loginData = { login: 'test' }
  //   const signUpData = { password: 'test', name: 'test', surname: 'test', permissions: {} }
  //   const signUpCb = jest.fn()
  //   const responseMock = jest.fn().mockReturnValue(false)
  //   const collectionMock = {
  //     doc: jest.fn().mockReturnThis(),
  //     get: jest.fn().mockReturnValue(Promise.resolve({ data: responseMock })),
  //     set: jest.fn().mockResolvedValueOnce(),
  //   }
  //   const collectionSpy = jest.spyOn(db, 'collection').mockImplementation(() => collectionMock)
  //   const registerFormLabelInputMocks = [{ value: 1 }]
  //   document.querySelectorAll = jest.fn().mockReturnValue(registerFormLabelInputMocks)
    
  //   const wrapper = mount(
  //     <SignUpForm />
  //   )
  //   const loginInput = wrapper.find({ name: 'login' }).instance()
  //   loginInput.value = loginData.login
  //   expect(loginInput.value).toEqual(loginData.login)

  //   wrapper.find('form').simulate('submit', { preventDefault: preventDefaultMock })

    // return register(eventMock, { ...loginData, ...signUpData }, signUpCb)
    //   .then(() => {
    //     expect(preventDefaultMock).toHaveBeenCalledTimes(1)

    //     expect(collectionSpy.mock.calls).toEqual([['users'], ['users']]);
    //     expect(collectionMock.doc.mock.calls).toEqual([[loginData.login], [loginData.login]])

    //     expect(collectionMock.get).toHaveBeenCalledTimes(1)
    //     expect(collectionMock.get).toHaveBeenCalledWith()

    //     expect(collectionMock.set).toHaveBeenCalledTimes(1)
    //     expect(collectionMock.set).toHaveBeenCalledWith(signUpData)

    //     expect(responseMock).toHaveBeenCalledTimes(1)

    //     expect(window.alert.mock.calls.length).toBe(1)
    //     expect(window.alert.mock.calls).toEqual([['Konto utworzone']])

    //     expect(signUpCb).toHaveBeenCalledWith({login: undefined, password: undefined, name: undefined, surname: undefined})
    //     expect(document.querySelectorAll).toHaveBeenCalledWith('#registerForm label input')
    //     expect(registerFormLabelInputMocks).toEqual([{ value: '' }])
    //   })
    //   .finally(() => {
    //     document.querySelectorAll.mockClear()
    //   })
//   })
// })

describe('Account Signup', () => {
  beforeEach(() => {
    window.alert = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
    window.alert.mockClear()
  })

  test('As a user I want to signup successfully', () => {
    const preventDefaultMock = jest.fn()
    const eventMock = { preventDefault: preventDefaultMock }
    const loginData = { login: 'test' }
    const signUpData = { password: 'test', name: 'test', surname: 'test', permissions: {} }
    const signUpCb = jest.fn()
    const responseMock = jest.fn().mockReturnValue(false)
    const collectionMock = {
      doc: jest.fn().mockReturnThis(),
      get: jest.fn().mockReturnValue(Promise.resolve({ data: responseMock })),
      set: jest.fn().mockResolvedValueOnce(),
    }
    const collectionSpy = jest.spyOn(db, 'collection').mockImplementation(() => collectionMock)
    const registerFormLabelInputMocks = [{ value: 1 }]
    document.querySelectorAll = jest.fn().mockReturnValue(registerFormLabelInputMocks)
    
    return register(eventMock, { ...loginData, ...signUpData }, signUpCb)
      .then(() => {
        expect(preventDefaultMock).toHaveBeenCalledTimes(1)

        expect(collectionSpy.mock.calls).toEqual([['users'], ['users']]);
        expect(collectionMock.doc.mock.calls).toEqual([[loginData.login], [loginData.login]])

        expect(collectionMock.get).toHaveBeenCalledTimes(1)
        expect(collectionMock.get).toHaveBeenCalledWith()

        expect(collectionMock.set).toHaveBeenCalledTimes(1)
        expect(collectionMock.set).toHaveBeenCalledWith(signUpData)

        expect(responseMock).toHaveBeenCalledTimes(1)

        expect(window.alert.mock.calls.length).toBe(1)
        expect(window.alert.mock.calls).toEqual([['Konto utworzone']])

        expect(signUpCb).toHaveBeenCalledWith({login: undefined, password: undefined, name: undefined, surname: undefined})
        expect(document.querySelectorAll).toHaveBeenCalledWith('#registerForm label input')
        expect(registerFormLabelInputMocks).toEqual([{ value: '' }])
      })
      .finally(() => {
        document.querySelectorAll.mockClear()
      })
  })

  test('As a user I want to signup successfully unless the account already exists', () => {
    const preventDefaultMock = jest.fn()
    const eventMock = { preventDefault: preventDefaultMock }
    const loginData = { login: 'test' }
    const signUpData = { password: 'test', name: 'test', surname: 'test', permissions: {} }
    const signUpCb = jest.fn()
    const collectionMock = {
      doc: jest.fn().mockReturnThis(),
      get: jest.fn().mockReturnValue(Promise.resolve({ data: jest.fn().mockReturnValue(true) })),
      set: jest.fn().mockResolvedValueOnce(),
    }
    const collectionSpy = jest.spyOn(db, 'collection').mockImplementationOnce(() => collectionMock)
    document.querySelectorAll = jest.fn()
    
    return register(eventMock, { ...loginData, ...signUpData }, signUpCb)
      .then(() => {
        expect(preventDefaultMock).toHaveBeenCalledTimes(1)

        expect(collectionSpy).toHaveBeenCalledTimes(1)
        expect(collectionSpy).toHaveBeenCalledWith('users')
        
        expect(collectionMock.doc).toHaveBeenCalledTimes(1)
        expect(collectionMock.doc).toHaveBeenCalledWith(loginData.login)

        expect(collectionMock.get).toHaveBeenCalledTimes(1)
        expect(collectionMock.get).toHaveBeenCalledWith()
        
        expect(collectionMock.set).not.toHaveBeenCalled()

        expect(window.alert.mock.calls.length).toBe(1)
        expect(window.alert.mock.calls).toEqual([['Konto już istnieje. Wybierz inny login']])

        expect(signUpCb).not.toHaveBeenCalled()
        expect(document.querySelectorAll).not.toHaveBeenCalled()
      })
      .catch(e => {
        console.error(e)
      })
      .finally(() => {
        document.querySelectorAll.mockClear()
      })
  })

  test('As a user I want to signup successfully unless the server error occured', () => {
    const preventDefaultMock = jest.fn()
    const eventMock = { preventDefault: preventDefaultMock }
    const loginData = { login: 'test' }
    const signUpData = { password: 'test', name: 'test', surname: 'test', permissions: {} }
    const signUpCb = jest.fn()
    
    const error = new Error('DB_TIMEOUT::501')
    const collectionMock = {
      doc: jest.fn().mockReturnThis(),
      get: jest.fn().mockReturnValue(Promise.reject(error))
    }
    const collectionSpy = jest.spyOn(db, 'collection').mockImplementationOnce(() => collectionMock)
    
    return register(eventMock, { ...loginData, ...signUpData }, signUpCb)
      .catch(e => {
        console.error(e)
        expect(preventDefaultMock).toHaveBeenCalledTimes(1)

        expect(collectionSpy).toHaveBeenCalledTimes(1)
        expect(collectionSpy).toHaveBeenCalledWith('users')

        expect(collectionMock.doc).toHaveBeenCalledTimes(1)
        expect(collectionMock.doc).toHaveBeenCalledWith(loginData.login)

        expect(collectionMock.get).toHaveBeenCalledTimes(1)
        expect(collectionMock.get).toHaveBeenCalledWith()

        expect(signUpCb).not.toHaveBeenCalled()
        
        expect(window.alert.mock.calls.length).toBe(1)
        expect(window.alert.mock.calls).toEqual([['Blad serwera. Sprobuj raz jeszcze [Kod: "DB_TIMEOUT::501"]']])
      })
  })
})
