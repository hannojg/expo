// Copyright 2018-present 650 Industries. All rights reserved.

#ifdef __cplusplus

#import <vector>
#import <jsi/jsi.h>
#import <ExpoModulesCore/JSIRuntime.h>

using namespace facebook;

namespace expo {

class JSI_EXPORT ExpoModulesHostObject : public jsi::HostObject {
public:
  ExpoModulesHostObject(JSIRuntime *runtime) : runtime(runtime) {}

  virtual ~ExpoModulesHostObject() {

  }

  virtual jsi::Value get(jsi::Runtime &, const jsi::PropNameID &name) {
    return jsi::Value::null();
  }

  virtual void set(jsi::Runtime &, const jsi::PropNameID &name, const jsi::Value &value) {

  }

  virtual std::vector<jsi::PropNameID> getPropertyNames(jsi::Runtime &rt) {
    std::vector<jsi::PropNameID> names;
    names.push_back(jsi::PropNameID::forAscii(rt, "dupa"));
    return names;
  }

private:
  JSIRuntime *runtime;
}; // class ExpoModulesHostObject

} // namespace expo

#endif
