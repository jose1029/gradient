import {createContext} from 'react'
import {User} from '../lib/database'

export default createContext<User | null | undefined>(undefined)
