import 'reflect-metadata'

const namespace = 'confgasm'
const key = name => Symbol(`${namespace}:${name}`)
const READER = key('reader')
const MEMBERS = key('members')

const p = (name: string, value: string) => ({
  Name: name,
  Type: 'String',
  Value: value,
  Version: 1,
  LastModifiedDate: new Date(),
  ARN: 'big-long-string',
})

function readRawData(members, parameters) {
  const result = {}
  for (const param of parameters) {
    const reader = members[param.Name]
    if (reader === undefined) continue
    result[param.Name] = param.Value
  }
  return result
}

function store<T extends { new (...args: any[]): {} }>(f: T) {
  const members = Reflect.getOwnMetadata(MEMBERS, f) || {}
  Reflect.defineMetadata(READER, params => readRawData(members, params), f)
}

function param(target: any, property: string) {
  var t = Reflect.getMetadata('design:type', target, property)
  const members = Reflect.getOwnMetadata(MEMBERS, target.constructor) || {}
  members[property] = { type: t }
  Reflect.defineMetadata(MEMBERS, members, target.constructor)
}

describe('when building a result object', () => {
  @store
  class Config {
    @param
    email: string
  }

  const input = [p('email', 'winning@life.com')]

  it('should be confusing as', () => {
    const builder = Reflect.getMetadata(READER, Config)
    const result = builder(input)
    expect(result).toEqual({
      email: 'winning@life.com',
    })
  })
})
