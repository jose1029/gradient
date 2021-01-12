/* eslint-disable import/no-cycle */

import {List, ObjectSchema, Results} from 'realm'
import {v4 as uuid} from 'uuid'
import {Metric} from './metric'
import {User} from './user'
import {app} from './db'

export class Goal {
  ownerId: string | undefined

  id: string

  createdAt: Date

  name: string

  color: string

  metrics: List<Metric>

  order: number

  user?: Results<User>

  static schema: ObjectSchema = {
    name: 'Goal',
    primaryKey: 'id',
    properties: {
      ownerId: 'string',
      id: 'string',
      createdAt: 'date',
      name: 'string',
      color: 'string',
      metrics: 'Metric[]',
      order: 'int',
      user: {
        type: 'linkingObjects',
        objectType: 'User',
        property: 'goals',
      },
    },
  }

  constructor(
    name: string,
    order: number,
    color = 'purple',
    metrics: Metric[] = [],
  ) {
    this.ownerId = app.currentUser?.id
    this.id = uuid()
    this.createdAt = new Date()
    this.name = name
    this.order = order
    this.color = color
    this.metrics = metrics as any
  }
}
