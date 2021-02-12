SSMble - a handy dandy config reader for AWS Parameter Store
------------------------------------------------------------

Here at Cazoo we recommend that applications fetch config at runtime from the
parameter store in SSM. This saves us from putting secrets into environment vars
and neatly separates config from deployment.

`ssmble` is a simple wrapper for the AWS SDK that makes building configuration
simpler.

Using Typescript decorators, we can automagically bind SSM parameter trees into
strongly-typed objects at runtime.

Usage
-----

Authoring a Configuration Template
===================================

SSMble works by mapping SSM parameters to the fields of an object literal.

Assuming the following parameters stored in SSM:

```
/my-service
   /secretText
   /options
     /name
     /age
   /bigness
   /isEnabled
```

We might choose to build the following configuration object.

```
import {cfg, read} from 'ssmble'


// This template object describes the shape of our config
const template = {

  // the `str` function describes a required string
  secretText: cfg.str(),
  
  // the `int` function describes a required integer
  bigness: cfg.int(),
  
  // the bool function describes a required boolean
  isEnabled: cfg.bool(),
  
  // template objects nest
  options: {
  
  // each `cfg` function has a `maybe` equivalent that takes
  // optional default, and returns `undefined` if the value
  // is missing.
    name: maybeStr(),
    age: maybeInt( { default: 38 }),
  
  }
}
```

Fetching configuration
=====================

The `getConfig` function makes the call to SSM and returns either a config object, or an Error result. The `Is` type provides type guards that let us check for success or failure in a type-safe way.

```
export async function loadConfig() {
    
    const response = getConfig(template, '/my-service')
    
    if (Is.result(response)) {
        return result
    }
    
    else {
        throw new Error(`Failed to load config due to missing fields ${response.fields}`)
    } 
}
```
