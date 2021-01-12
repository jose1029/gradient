/* eslint-disable import/no-cycle */

import {List, ObjectSchema, Results} from 'realm'
import {v4 as uuid} from 'uuid'
import {Goal} from './goal'
import {app} from './db'

export class User {
  ownerId: string | undefined

  id: string

  createdAt: Date

  goals: List<Goal>

  isActive: boolean

  isDebug: boolean

  static schema: ObjectSchema = {
    name: 'User',
    primaryKey: 'id',
    properties: {
      ownerId: 'string',
      id: 'string',
      createdAt: 'date',
      goals: 'Goal[]',
      isActive: {type: 'bool', default: true},
      isDebug: {type: 'bool', default: false},
    },
  }

  constructor(goals: Goal[] = [], isActive = true, isDebug = false) {
    this.ownerId = app.currentUser?.id
    this.id = uuid()
    this.createdAt = new Date()
    this.goals = goals as any
    this.isActive = isActive
    this.isDebug = isDebug
  }
}
