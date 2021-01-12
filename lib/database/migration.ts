/* eslint-disable import/no-cycle */
/* eslint-disable no-param-reassign */

import moment from 'moment'
import {v4 as uuid} from 'uuid'
import {Goal} from './goal'
import {Metric} from './metric'
import {Report} from './report'
import {User} from './user'
import {app} from './db'

export default (oldRealm: Realm, newRealm: Realm) => {
  if (oldRealm.schemaVersion < 10) {
    newRealm.objects<Goal>(Goal.schema.name).forEach((goal) => {
      goal.color = 'purple'
    })
  }

  if (oldRealm.schemaVersion < 14) {
    newRealm.objects<User>(User.schema.name).forEach((user) => {
      user.id = uuid()
      user.createdAt = moment().toDate()
    })
  }

  if (oldRealm.schemaVersion < 15) {
    newRealm.objects<Goal>(Goal.schema.name).forEach((goal) => {
      goal.createdAt = moment().toDate()
    })
    newRealm.objects<Metric>(Metric.schema.name).forEach((metric) => {
      metric.createdAt = moment().toDate()
    })
  }

  if (oldRealm.schemaVersion < 16) {
    newRealm.objects<Goal>(Goal.schema.name).forEach((goal) => {
      goal.id = uuid()
    })
    newRealm.objects<Metric>(Metric.schema.name).forEach((metric) => {
      metric.id = uuid()
    })
    newRealm.objects<Report>(Report.schema.name).forEach((report) => {
      report.id = uuid()
      report.createdAt = moment().toDate()
    })
  }

  if (oldRealm.schemaVersion < 18) {
    newRealm.objects<Metric>(Metric.schema.name).forEach((metric) => {
      metric.weight = 50
    })
  }

  if (oldRealm.schemaVersion < 20) {
    const index = 0
    newRealm
      .objects<Goal>(Goal.schema.name)
      .sorted('createdAt')
      .forEach((goal) => {
        goal.order = index
      })
  }

  if (oldRealm.schemaVersion < 21) {
    newRealm.objects<User>(User.schema.name).forEach((user) => {
      user.ownerId = app.currentUser?.id
    })
    newRealm.objects<Goal>(Goal.schema.name).forEach((goal) => {
      goal.ownerId = app.currentUser?.id
    })
    newRealm.objects<Metric>(Metric.schema.name).forEach((metric) => {
      metric.ownerId = app.currentUser?.id
    })
    newRealm.objects<Report>(Report.schema.name).forEach((report) => {
      report.ownerId = app.currentUser?.id
    })
  }
}
