// Copyright 2018-present 650 Industries. All rights reserved.

#import <jsi/jsi.h>
#import <ReactCommon/CallInvoker.h>
#import <ExpoModulesCore/JSIRuntime.h>
#import <ExpoModulesCore/ExpoModulesHostObject.h>

using namespace facebook;

@interface RCTBridge (JSI)
- (void *)runtime;
- (std::shared_ptr<facebook::react::CallInvoker>)jsCallInvoker;
@end

@implementation JSIRuntime {
  std::shared_ptr<jsi::Runtime> _runtime;
  std::shared_ptr<react::CallInvoker> _jsCallInvoker;
  std::shared_ptr<jsi::Object> _expoModulesObject;

//  NSSet<NSString *> *moduleNames;
}

- (instancetype)initWithBridge:(nonnull RCTBridge *)bridge
{
  if (self = [super init]) {
    _jsCallInvoker = bridge.jsCallInvoker;
    _runtime = std::shared_ptr<jsi::Runtime>([bridge respondsToSelector:@selector(runtime)] ? reinterpret_cast<jsi::Runtime *>(bridge.runtime) : nullptr);
    [self prepareRuntime];
  }
  return self;
}

- (jsi::Runtime *)runtime
{
  return _runtime.get();
}

- (void)prepareRuntime
{
  if (_expoModulesObject) {
    // Object was initialized, so the runtime is already "prepared".
    return;
  }

  auto runtime = [self runtime];
  auto hostObject = std::make_shared<expo::ExpoModulesHostObject>(self);

  _expoModulesObject = std::make_shared<jsi::Object>(jsi::Object::createFromHostObject(*runtime, hostObject));

  runtime->global()
    .setProperty(*runtime, "ExpoModules", *_expoModulesObject.get());
}

- (nonnull JSIObject *)global
{
  auto global = std::make_shared<jsi::Object>(_runtime->global());
  return [[JSIObject alloc] initFrom:global withRuntime:_runtime callInvoker:_jsCallInvoker];
}

- (nonnull JSIObject *)mainObject
{
  return [[JSIObject alloc] initFrom:_expoModulesObject withRuntime:_runtime callInvoker:_jsCallInvoker];
}

- (nonnull JSIObject *)createObject
{
  auto object = std::make_shared<jsi::Object>(jsi::Object(*_runtime.get()));
  return [[JSIObject alloc] initFrom:object withRuntime:_runtime callInvoker:_jsCallInvoker];
}

@end
