// Copyright 2018-present 650 Industries. All rights reserved.

#import <React/RCTBridge.h>
#import <ExpoModulesCore/JSIObject.h>

@interface JSIRuntime : NSObject

- (instancetype)initWithBridge:(nonnull RCTBridge *)bridge;

- (nonnull JSIObject *)global;
- (nonnull JSIObject *)mainObject;
- (nonnull JSIObject *)createObject;
- (void)registerModuleObject:(nonnull JSIObject *)moduleObject withName:(nonnull NSString *)name;

@end
