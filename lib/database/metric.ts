/* eslint-disable import/no-cycle */

import {List, ObjectSchema, Results} from 'realm'
import {v4 as uuid} from 'uuid'
import {Goal} from './goal'
import {Report} from './report'
import {app} from './db'

export class Metric {
  ownerId: string | undefined

  id: string

  createdAt: Date

  name: string

  isSnapshot: boolean

  isDecreasing: boolean

  weight: number

  reports: List<Report>

  goal?: Results<Goal>

  static schema: ObjectSchema = {
    name: 'Metric',
    primaryKey: 'id',
    properties: {
      ownerId: 'string',
      id: 'string',
      createdAt: 'date',
      name: 'string',
      isSnapshot: 'bool',
      isDecreasing: 'bool',
      weight: 'double',
      reports: 'Report[]',
      goal: {
        type: 'linkingObjects',
        objectType: 'Goal',
        property: 'metrics',
      },
    },
  }

  constructor(
    name = '',
    isSnapshot = false,
    isDecreasing = false,
    weight = 50,
    reports: Report[] = [],
  ) {
    this.ownerId = app.currentUser?.id
    this.id = uuid()
    this.createdAt = new Date()
    this.name = name
    this.isSnapshot = isSnapshot
    this.isDecreasing = isDecreasing
    this.weight = weight
    this.reports = reports as any
  }
}
