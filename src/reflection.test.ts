import { store, param, getReader } from './reader'
import { isMissingFields, MissingFields } from './error'

function shouldBe<T>(fn: (t1) => t1 is T, t): T {
  if (fn(t)) {
    return t
  }
  throw 'Expected a thing to be a different thing'
}

const p = (name: string, value: string) => ({
  Name: name,
  Type: 'String',
  Value: value,
  Version: 1,
  LastModifiedDate: new Date(),
  ARN: 'big-long-string',
})

describe('when building a result object', () => {
  @store('/service/trevoror')
  class Config {
    @param
    email: string
    @param
    age: number
    @param
    isExcellent: boolean
  }

  const input = [
    p('/service/trevoror/email', 'winning@life.com'),
    p('/service/trevoror/age', '22'),
    p('/service/trevoror/isExcellent', 'true'),
  ]

  it('should return the correct types', () => {
    const builder = getReader<Config>(Config)
    const result = builder(input)
    expect(result).toEqual({
      email: 'winning@life.com',
      age: 22,
      isExcellent: true,
    })
  })
})

describe('when the parameters list contains extra elements', () => {
  @store('/foo')
  class Config {
    @param
    email: string
  }

  const input = [p('/foo/email', 'winning@life.com'), p('/foo/age', '22')]

  it('should return the correct types', () => {
    const builder = getReader<Config>(Config)
    const result = builder(input)
    expect(result).toEqual({
      email: 'winning@life.com',
    })
  })
})

describe('when there are values missing in the response', () => {
  @store('/missing-fields')
  class Config {
    @param
    email: string
    @param
    isExcellent: boolean
  }

  const input = [p('/missing-fields/age', '22')]

  it('should return an error for the missing config keys', () => {
    const builder = getReader<Config>(Config)
    const result = shouldBe<MissingFields>(isMissingFields, builder(input))
    expect(result.fields).toEqual(['email', 'isExcellent'])
  })
})
