/* eslint-disable import/no-cycle */

import {ObjectSchema, Results} from 'realm'
import {v4 as uuid} from 'uuid'
import {Metric} from './metric'
import {app} from './db'

export class Report {
  ownerId: string | undefined

  id: string

  createdAt: Date

  date: Date

  value: number

  metric?: Results<Metric>

  static schema: ObjectSchema = {
    name: 'Report',
    primaryKey: 'id',
    properties: {
      ownerId: 'string',
      id: 'string',
      createdAt: 'date',
      date: {type: 'date', indexed: true},
      value: 'double',
      metric: {
        type: 'linkingObjects',
        objectType: 'Metric',
        property: 'reports',
      },
    },
  }

  constructor(date: Date, value: number) {
    this.ownerId = app.currentUser?.id
    this.id = uuid()
    this.createdAt = new Date()
    this.date = date
    this.value = value
  }
}
