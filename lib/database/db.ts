/* eslint-disable import/no-cycle */

import moment from 'moment'
import {v4 as uuid} from 'uuid'
import jwt from 'react-native-pure-jwt'
import Realm from 'realm'
import {Goal} from './goal'
import {Metric} from './metric'
import {Report} from './report'
import {User} from './user'
import migration from './migration'
import {showDefaultError} from '../error'

const REALM_APP_ID_DEV = 'gradient-dev-fdtrm'
const REALM_APP_ID_PROD = 'gradient-ryhal'
const JWT_SECRET = 'cdfb0413fa199e92509d2accd32b65fd'

export const app = new Realm.App({
  id: __DEV__ ? REALM_APP_ID_DEV : REALM_APP_ID_PROD,
})

let database: Realm | null = null

const migrateLocalData = (realm: Realm) => {
  const localRealm = new Realm({
    schema: [User.schema, Goal.schema, Metric.schema, Report.schema],
    schemaVersion: 21,
    migration,
  })
  const localUsers = localRealm.objects<User>(User.schema.name)

  if (localUsers.length) {
    try {
      realm.write(() => {
        localRealm.objects<User>(User.schema.name).forEach((user) => {
          user.goals.forEach((goal) => {
            goal.metrics.forEach((metric) => {
              metric.reports.forEach((report) => {
                realm.create(Report.schema.name, report, Realm.UpdateMode.All)
              })
              realm.create(Metric.schema.name, metric, Realm.UpdateMode.All)
            })
            realm.create(Goal.schema.name, goal, Realm.UpdateMode.All)
          })
          realm.create(User.schema.name, user, Realm.UpdateMode.All)
        })
      })
    } catch (e) {
      showDefaultError(e, true)
    }
  }
}

export const isAuthenticated = () => !!app.currentUser

export const authenticate = () =>
  // TODO figure out TS issue
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  jwt
    .sign(
      {
        aud: app.id,
        sub: uuid(),
        exp: moment().add(100, 'years').valueOf(),
      },
      JWT_SECRET,
      {
        alg: 'HS256',
      },
    )
    .then((token: string) => {
      const credentials = Realm.Credentials.jwt(token)
      return app.logIn(credentials)
    })

export const connect = () => {
  if (!app.currentUser) {
    throw new Error('Not authenticated')
  }

  return Realm.open({
    sync: {
      user: app.currentUser,
      partitionValue: app.currentUser.id,
    },
    schema: [User.schema, Goal.schema, Metric.schema, Report.schema],
  }).then((realm) => {
    if (realm.objects<User>(User.schema.name).length === 0) {
      migrateLocalData(realm)
    }

    database = realm
    return realm
  })
}

export const db = () => database
