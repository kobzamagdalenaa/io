import React from 'react'
import { act } from 'react-dom/test-utils'
import renderer from 'react-test-renderer'
import Enzyme, { mount } from 'enzyme'
import Adapter from '@wojtekmaj/enzyme-adapter-react-17'

import { db } from '../db';
import { loginAs } from './login'

jest.mock('../db');
jest.mock('../services/account.serviceb');
Enzyme.configure({ adapter: new Adapter() })

describe('LoginAs', () => {
    beforeEach(() => {
      window.alert = jest.fn()
    })
  
    afterEach(() => {
      jest.clearAllMocks()
      window.alert.mockClear()
    })
  
    test('Login unsuccessful', () => {
        const preventDefaultMock = jest.fn()
        const eventMock = { preventDefault: preventDefaultMock }
        const loginData = { login: 'test', password: 'test' }
        const setAvailableHospitals = jest.fn()
        const collectionMock = {
            get: jest.fn().mockReturnValue()//tu jeszcze nw
        }
        const collectionSpy = jest.spyOn(db, 'collection',).mockImplementationOnce(() => collectionMock)
        

        return loginAs(eventMock, { ...loginData}, setAvailableHospitals)
        .then(() => {
            expect(preventDefaultMock).toHaveBeenCalledTimes(1)

            expect(collectionSpy).toHaveBeenCalledTimes(1)
            expect(collectionSpy).toHaveBeenCalledWith()

            expect(collectionMock.get).toHaveBeenCalledTimes(1)
            expect(collectionMock.get).toHaveBeenCalledWith()

            expect(setAvailableHospitals).toHaveBeenCalledTimes(0)
    
            expect(window.alert.mock.calls.length).toBe(1)
            expect(window.alert.mock.calls).toEqual([['złe dane']])
          })
      })
    })
    
    