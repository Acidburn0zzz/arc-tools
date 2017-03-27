<a name="1.2.66"></a>
## [1.2.66](https://github.com/advanced-rest-client/arc-tools/compare/1.2.65...v1.2.66) (2017-03-27)


### Fix

* Fixed issue when cloning new repo. Dir paths will be computed properly and code wilol be executed in element's directory ([196b8e15ae4213b64b6994f8dbefa7218b33d2c8](https://github.com/advanced-rest-client/arc-tools/commit/196b8e15ae4213b64b6994f8dbefa7218b33d2c8))



<a name="1.2.65"></a>
## [1.2.65](https://github.com/advanced-rest-client/arc-tools/compare/1.2.64...v1.2.65) (2017-01-12)


### Update

* in the docs command, the badge will not point to the stage branch instead of master ([8c079a6056c36c0c34027203dad0cb58fd432748](https://github.com/advanced-rest-client/arc-tools/commit/8c079a6056c36c0c34027203dad0cb58fd432748))



<a name="1.2.64"></a>
## [1.2.64](https://github.com/advanced-rest-client/arc-tools/compare/1.2.63...v1.2.64) (2017-01-11)


### Fix

* Fixed an issue when trying to pull a repo from non existing branch. Now it update active branch only ([7d97263fcd3be34dbff773e17f0b22c3256cf625](https://github.com/advanced-rest-client/arc-tools/commit/7d97263fcd3be34dbff773e17f0b22c3256cf625))

### New

* Added verbose message if bower and node is required to install ([4c52bc6f419aa336a655d89668eea19ae613f6d5](https://github.com/advanced-rest-client/arc-tools/commit/4c52bc6f419aa336a655d89668eea19ae613f6d5))
* Moved to GraphQL for GitHub to list the repositories ([6ebc09bd4fcd4abf9539dd52eafac31c5a712bb1](https://github.com/advanced-rest-client/arc-tools/commit/6ebc09bd4fcd4abf9539dd52eafac31c5a712bb1))



<a name="1.2.63"></a>
## [1.2.63](https://github.com/advanced-rest-client/arc-tools/compare/1.2.62...v1.2.63) (2017-01-09)


### Fix

* fixed result of the function that reads current git branch - now the result will be trimmed ([29f9515c87e8d8c3a38eb8e0275ad1ef37148b8c](https://github.com/advanced-rest-client/arc-tools/commit/29f9515c87e8d8c3a38eb8e0275ad1ef37148b8c))



<a name="1.2.62"></a>
## [1.2.62](https://github.com/advanced-rest-client/arc-tools/compare/1.2.61...v1.2.62) (2017-01-05)


### Fix

* Fixed an issue when the clone command failed if there's no stage or master branch ([833f621276feab60c12a139fa77a4bd995e1047d](https://github.com/advanced-rest-client/arc-tools/commit/833f621276feab60c12a139fa77a4bd995e1047d))



<a name="1.2.61"></a>
## [1.2.61](https://github.com/advanced-rest-client/arc-tools/compare/1.2.60...v1.2.61) (2017-01-05)


### Fix

* Fixed an issue when the stage command failed if there is not CHANGELOG.md file ([e3fab8ba257b3cc617893e4a9e48f4b3beedc6bb](https://github.com/advanced-rest-client/arc-tools/commit/e3fab8ba257b3cc617893e4a9e48f4b3beedc6bb))



<a name="1.2.60"></a>
## [1.2.60](https://github.com/advanced-rest-client/arc-tools/compare/1.2.59...v1.2.60) (2017-01-05)


### Fix

* Fixed an issue where the stage command failed when the package file wans't available ([071f97d2cc9104d78577f4337e7ae1d13ca82ca6](https://github.com/advanced-rest-client/arc-tools/commit/071f97d2cc9104d78577f4337e7ae1d13ca82ca6))



<a name="1.2.59"></a>
## [1.2.59](https://github.com/advanced-rest-client/arc-tools/compare/1.2.58...v1.2.59) (2016-12-22)


### Fix

* Fixed stage command - now it will push changes to stage before operating on master branch ([83df8eb4b6bd9c2d4bae34265b2b7a194057a7b2](https://github.com/advanced-rest-client/arc-tools/commit/83df8eb4b6bd9c2d4bae34265b2b7a194057a7b2))



<a name="1.2.58"></a>
## [1.2.58](https://github.com/advanced-rest-client/arc-tools/compare/1.2.57...v1.2.58) (2016-12-19)


### Fix

* Fixed paths in staging command ([b580ad94c6fb62e6f2864d19e869ee9c5cc6c0e0](https://github.com/advanced-rest-client/arc-tools/commit/b580ad94c6fb62e6f2864d19e869ee9c5cc6c0e0))



<a name="1.2.57"></a>
## [1.2.57](https://github.com/advanced-rest-client/arc-tools/compare/1.2.56...v1.2.57) (2016-12-16)




<a name="1.2.56"></a>
## [1.2.56](https://github.com/advanced-rest-client/arc-tools/compare/1.2.55...v1.2.56) (2016-11-29)


### Update

* added reset option when merging with master ([f8a7abc0162cd4f3b48181cda14eba5f7c26180a](https://github.com/advanced-rest-client/arc-tools/commit/f8a7abc0162cd4f3b48181cda14eba5f7c26180a))



<a name="1.2.54"></a>
## [1.2.54](https://github.com/advanced-rest-client/arc-tools/compare/1.2.53...v1.2.54) (2016-11-21)


### Update

* Added JSON formatter to the bump script ([c97f827533b52334fbe3757affc196098ec7fa0a](https://github.com/advanced-rest-client/arc-tools/commit/c97f827533b52334fbe3757affc196098ec7fa0a))



<a name="1.2.53"></a>
## [1.2.53](https://github.com/advanced-rest-client/arc-tools/compare/1.2.52...v1.2.53) (2016-11-19)


### Fix

* Added branch name to git merge when marging master with stage ([0e3d730c2347402a9d6f157dce6d47902227fc73](https://github.com/advanced-rest-client/arc-tools/commit/0e3d730c2347402a9d6f157dce6d47902227fc73))



<a name="1.2.52"></a>
## [1.2.52](https://github.com/advanced-rest-client/arc-tools/compare/1.2.51...v1.2.52) (2016-11-19)


### Fix

* Added branch name to git merge when marging master with stage ([b6e77788c5a719ae64a299e0c9ccb774912e0297](https://github.com/advanced-rest-client/arc-tools/commit/b6e77788c5a719ae64a299e0c9ccb774912e0297))



<a name="1.2.51"></a>
## [1.2.51](https://github.com/advanced-rest-client/arc-tools/compare/1.2.50...v1.2.51) (2016-11-19)


### Update

* Added exec vervose output ([3eac82e4b176fc1c9785eb4ad0741e7af097ed33](https://github.com/advanced-rest-client/arc-tools/commit/3eac82e4b176fc1c9785eb4ad0741e7af097ed33))



<a name="1.2.50"></a>
## [1.2.50](https://github.com/advanced-rest-client/arc-tools/compare/1.2.49...v1.2.50) (2016-11-19)


### Update

* Added more verbose output ([513ea5fa04a15f9241329b64518fcba9355b0d47](https://github.com/advanced-rest-client/arc-tools/commit/513ea5fa04a15f9241329b64518fcba9355b0d47))



<a name="1.2.49"></a>
## [1.2.49](https://github.com/advanced-rest-client/arc-tools/compare/1.2.48...v1.2.49) (2016-11-19)


### Update

* Changed automated commit message ([04a6b39a6658053d3e9df22abe117d01819edc51](https://github.com/advanced-rest-client/arc-tools/commit/04a6b39a6658053d3e9df22abe117d01819edc51))



<a name="1.2.48"></a>
## [1.2.48](https://github.com/advanced-rest-client/arc-tools/compare/1.2.47...v1.2.48) (2016-11-19)


### Update

* Fixed stage command, now it will work outside the element's directory. Cleared code and integrated with other commands internally ([44ab3fbad9edd83699a59e543aa22dfb18c10d6c](https://github.com/advanced-rest-client/arc-tools/commit/44ab3fbad9edd83699a59e543aa22dfb18c10d6c))



<a name="1.2.47"></a>
## [1.2.47](https://github.com/advanced-rest-client/arc-tools/compare/1.2.46...v1.2.47) (2016-11-07)


### Update

* Updated clone command, fixed cloning errors and the comman will now check for bower/package changes in the changees list. Also, bower/npm update is not performed by the script  ([185cfa9ab0a322f9f0c298f0a705d000703be595](https://github.com/advanced-rest-client/arc-tools/commit/185cfa9ab0a322f9f0c298f0a705d000703be595))



<a name="1.2.46"></a>
## [1.2.46](https://github.com/advanced-rest-client/arc-tools/compare/1.2.45...v1.2.46) (2016-11-07)


### Fix

* Fixed script for structure command ([18e881f91426ed941a72074e44d04da511c34769](https://github.com/advanced-rest-client/arc-tools/commit/18e881f91426ed941a72074e44d04da511c34769))



<a name="1.2.45"></a>
## [1.2.45](https://github.com/advanced-rest-client/arc-tools/compare/1.2.41...v1.2.45) (2016-10-11)


### Docs

* Created docs for the tools ([ba87917d6183a85432b649b1b9f39f75ca90f6a1](https://github.com/advanced-rest-client/arc-tools/commit/ba87917d6183a85432b649b1b9f39f75ca90f6a1))

### Fix

* Fix for commands in git pull function ([7216fe67c65f8eae73614d4f7df6795ee153a2d4](https://github.com/advanced-rest-client/arc-tools/commit/7216fe67c65f8eae73614d4f7df6795ee153a2d4))
* Fixed invalid options parsing ([923b908d7b20a0904a8e1c72b08123db01252e28](https://github.com/advanced-rest-client/arc-tools/commit/923b908d7b20a0904a8e1c72b08123db01252e28))
* Fixed issue with reading a bower file in current directory ([1ad7912d25c16e0a88d13dde4b48226b842f9ef5](https://github.com/advanced-rest-client/arc-tools/commit/1ad7912d25c16e0a88d13dde4b48226b842f9ef5))

### New

* Added dependencyci.yml file ([65368fee99189e003563185481a028275a214af2](https://github.com/advanced-rest-client/arc-tools/commit/65368fee99189e003563185481a028275a214af2))

### Update

* Added path for message output on clone command ([cc82fca7d76d3c0cb2de66c96a608a78cb081066](https://github.com/advanced-rest-client/arc-tools/commit/cc82fca7d76d3c0cb2de66c96a608a78cb081066))
* Cleaned code ([3ead18774fa56447ac3c5a301d729238e31e403c](https://github.com/advanced-rest-client/arc-tools/commit/3ead18774fa56447ac3c5a301d729238e31e403c))
* Removed unused commands ([cf094333efc3fbc003dca8ff727cbe49457adfef](https://github.com/advanced-rest-client/arc-tools/commit/cf094333efc3fbc003dca8ff727cbe49457adfef))



<a name="1.2.44"></a>
## [1.2.44](https://github.com/advanced-rest-client/arc-tools/compare/1.2.43...v1.2.44) (2016-10-07)


### Fix

* Fixed issue with reading a bower file in current directory ([1ad7912d25c16e0a88d13dde4b48226b842f9ef5](https://github.com/advanced-rest-client/arc-tools/commit/1ad7912d25c16e0a88d13dde4b48226b842f9ef5))



<a name="1.2.43"></a>
## [1.2.43](https://github.com/advanced-rest-client/arc-tools/compare/1.2.42...v1.2.43) (2016-10-06)


### Docs

* Created docs for the tools ([ba87917d6183a85432b649b1b9f39f75ca90f6a1](https://github.com/advanced-rest-client/arc-tools/commit/ba87917d6183a85432b649b1b9f39f75ca90f6a1))

### Fix

* Fixed invalid options parsing ([923b908d7b20a0904a8e1c72b08123db01252e28](https://github.com/advanced-rest-client/arc-tools/commit/923b908d7b20a0904a8e1c72b08123db01252e28))

### New

* Added dependencyci.yml file ([65368fee99189e003563185481a028275a214af2](https://github.com/advanced-rest-client/arc-tools/commit/65368fee99189e003563185481a028275a214af2))

### Update

* Removed unused commands ([cf094333efc3fbc003dca8ff727cbe49457adfef](https://github.com/advanced-rest-client/arc-tools/commit/cf094333efc3fbc003dca8ff727cbe49457adfef))



<a name="1.2.42"></a>
## [1.2.42](https://github.com/advanced-rest-client/arc-tools/compare/1.2.40...v1.2.42) (2016-10-06)


### Fix

* Fixed issues with arc clone command: fixed paths resolover, fixed error catching and reacting on errors ([282c6992f4d3630ae76ba72271b985765cefc348](https://github.com/advanced-rest-client/arc-tools/commit/282c6992f4d3630ae76ba72271b985765cefc348))

### Update

* Added path for message output on clone command ([cc82fca7d76d3c0cb2de66c96a608a78cb081066](https://github.com/advanced-rest-client/arc-tools/commit/cc82fca7d76d3c0cb2de66c96a608a78cb081066))
* Cleaned code ([3ead18774fa56447ac3c5a301d729238e31e403c](https://github.com/advanced-rest-client/arc-tools/commit/3ead18774fa56447ac3c5a301d729238e31e403c))



<a name="1.2.41"></a>
## [1.2.41](https://github.com/advanced-rest-client/arc-tools/compare/1.0.22...v1.2.41) (2016-10-04)


### Breaking

* Change in the clone command. Now it will use ssh by default and leaving '--no-ssh' option to clone over http ([9c40b9cace592ae8227a97584dfea00a69a153f5](https://github.com/advanced-rest-client/arc-tools/commit/9c40b9cace592ae8227a97584dfea00a69a153f5))
* Commands chnaged. Removed option quiet since the spinner has been removed as well. All commands now have option 'verbose' to display log messages. Created base class for common methods and cleaned code ([3014c96e6cee542dd7d45391318c29fffb88a92f](https://github.com/advanced-rest-client/arc-tools/commit/3014c96e6cee542dd7d45391318c29fffb88a92f))

### Fix

* Fixed issues with arc clone command: fixed paths resolover, fixed error catching and reacting on errors ([282c6992f4d3630ae76ba72271b985765cefc348](https://github.com/advanced-rest-client/arc-tools/commit/282c6992f4d3630ae76ba72271b985765cefc348))
* Fixed structure command ([2b930675f4c4cedc198488f12ea9644ea16b2611](https://github.com/advanced-rest-client/arc-tools/commit/2b930675f4c4cedc198488f12ea9644ea16b2611))
* git pull on structure element will reset the element to the origin/master when there's an error during regular pull ([8380d66aab1bd16399813609fb1f3ddc888d3c22](https://github.com/advanced-rest-client/arc-tools/commit/8380d66aab1bd16399813609fb1f3ddc888d3c22))

### New

* Added new options ([ee66fadc9294e82da8e40629ea0c8d30bb416853](https://github.com/advanced-rest-client/arc-tools/commit/ee66fadc9294e82da8e40629ea0c8d30bb416853))
* Added new options ([555d417549f19eaf3994fdda6374548bc4f31264](https://github.com/advanced-rest-client/arc-tools/commit/555d417549f19eaf3994fdda6374548bc4f31264))
* Added new options ([a6523aabe9d4024bef74444b65529ca316443f4e](https://github.com/advanced-rest-client/arc-tools/commit/a6523aabe9d4024bef74444b65529ca316443f4e))
* Added new options ([cd9184537ff44b4df2bbe500a86694caaf771eed](https://github.com/advanced-rest-client/arc-tools/commit/cd9184537ff44b4df2bbe500a86694caaf771eed))
* Added new options ([1ebd66b16b55c27baf1a06327b464e53b0935676](https://github.com/advanced-rest-client/arc-tools/commit/1ebd66b16b55c27baf1a06327b464e53b0935676))
* Added new options ([26361426995a965f18b1c05fcc3ca34cae112b65](https://github.com/advanced-rest-client/arc-tools/commit/26361426995a965f18b1c05fcc3ca34cae112b65))
* Added new options ([639e1c6a67dfb70fe8f1278d3b238bbf7a6832f4](https://github.com/advanced-rest-client/arc-tools/commit/639e1c6a67dfb70fe8f1278d3b238bbf7a6832f4))
* Added new options ([c8ba4c2b7ff524670d1464ed885b74370a0813a5](https://github.com/advanced-rest-client/arc-tools/commit/c8ba4c2b7ff524670d1464ed885b74370a0813a5))
* Added new options ([930370bafeb70a4621154bac94d2807c8f90322e](https://github.com/advanced-rest-client/arc-tools/commit/930370bafeb70a4621154bac94d2807c8f90322e))
* Added new options ([1cbfe609eca2b087751ae88b88c604d71eef2e45](https://github.com/advanced-rest-client/arc-tools/commit/1cbfe609eca2b087751ae88b88c604d71eef2e45))
* Added new options ([4b63ac82c5bef80db34ac6ca53b568fde41d7f63](https://github.com/advanced-rest-client/arc-tools/commit/4b63ac82c5bef80db34ac6ca53b568fde41d7f63))
* Added new options ([fbdadfc8890b2f7fde8ca98fb0aa44e0d0b7fefd](https://github.com/advanced-rest-client/arc-tools/commit/fbdadfc8890b2f7fde8ca98fb0aa44e0d0b7fefd))
* Added new options ([616421cb3458829ccd7173d0deda45679108899f](https://github.com/advanced-rest-client/arc-tools/commit/616421cb3458829ccd7173d0deda45679108899f))
* Added new options ([662f885ee0c2d2e18dbd56a1cd9e116e47bf1bbb](https://github.com/advanced-rest-client/arc-tools/commit/662f885ee0c2d2e18dbd56a1cd9e116e47bf1bbb))



<a name="1.2.40"></a>
## [1.2.40](https://github.com/advanced-rest-client/arc-tools/compare/1.1.39...v1.2.40) (2016-10-04)


### Breaking

* Commands chnaged. Removed option quiet since the spinner has been removed as well. All commands now have option 'verbose' to display log messages. Created base class for common methods and cleaned code ([3014c96e6cee542dd7d45391318c29fffb88a92f](https://github.com/advanced-rest-client/arc-tools/commit/3014c96e6cee542dd7d45391318c29fffb88a92f))



<a name="1.1.39"></a>
## [1.1.39](https://github.com/advanced-rest-client/arc-tools/compare/1.0.38...v1.1.39) (2016-10-03)


### Breaking

* Change in the clone command. Now it will use ssh by default and leaving '--no-ssh' option to clone over http ([9c40b9cace592ae8227a97584dfea00a69a153f5](https://github.com/advanced-rest-client/arc-tools/commit/9c40b9cace592ae8227a97584dfea00a69a153f5))



<a name="1.0.38"></a>
## [1.0.38](https://github.com/advanced-rest-client/arc-tools/compare/1.0.37...v1.0.38) (2016-10-02)


### Fix

* git pull on structure element will reset the element to the origin/master when there's an error during regular pull ([8380d66aab1bd16399813609fb1f3ddc888d3c22](https://github.com/advanced-rest-client/arc-tools/commit/8380d66aab1bd16399813609fb1f3ddc888d3c22))



<a name="1.0.37"></a>
## [1.0.37](https://github.com/advanced-rest-client/arc-tools/compare/1.0.36...v1.0.37) (2016-09-29)


### New

* Added new options ([555d417549f19eaf3994fdda6374548bc4f31264](https://github.com/advanced-rest-client/arc-tools/commit/555d417549f19eaf3994fdda6374548bc4f31264))



<a name="1.0.36"></a>
## [1.0.36](https://github.com/advanced-rest-client/arc-tools/compare/1.0.35...v1.0.36) (2016-09-29)


### New

* Added new options ([c8ba4c2b7ff524670d1464ed885b74370a0813a5](https://github.com/advanced-rest-client/arc-tools/commit/c8ba4c2b7ff524670d1464ed885b74370a0813a5))



<a name="1.0.35"></a>
## [1.0.35](https://github.com/advanced-rest-client/arc-tools/compare/1.0.34...v1.0.35) (2016-09-29)


### New

* Added new options ([a6523aabe9d4024bef74444b65529ca316443f4e](https://github.com/advanced-rest-client/arc-tools/commit/a6523aabe9d4024bef74444b65529ca316443f4e))



<a name="1.0.34"></a>
## [1.0.34](https://github.com/advanced-rest-client/arc-tools/compare/1.0.33...v1.0.34) (2016-09-29)


### New

* Added new options ([cd9184537ff44b4df2bbe500a86694caaf771eed](https://github.com/advanced-rest-client/arc-tools/commit/cd9184537ff44b4df2bbe500a86694caaf771eed))



<a name="1.0.33"></a>
## [1.0.33](https://github.com/advanced-rest-client/arc-tools/compare/1.0.32...v1.0.33) (2016-09-29)


### New

* Added new options ([1ebd66b16b55c27baf1a06327b464e53b0935676](https://github.com/advanced-rest-client/arc-tools/commit/1ebd66b16b55c27baf1a06327b464e53b0935676))



<a name="1.0.32"></a>
## [1.0.32](https://github.com/advanced-rest-client/arc-tools/compare/1.0.31...v1.0.32) (2016-09-29)


### New

* Added new options ([26361426995a965f18b1c05fcc3ca34cae112b65](https://github.com/advanced-rest-client/arc-tools/commit/26361426995a965f18b1c05fcc3ca34cae112b65))



<a name="1.0.31"></a>
## [1.0.31](https://github.com/advanced-rest-client/arc-tools/compare/1.0.30...v1.0.31) (2016-09-29)


### New

* Added new options ([639e1c6a67dfb70fe8f1278d3b238bbf7a6832f4](https://github.com/advanced-rest-client/arc-tools/commit/639e1c6a67dfb70fe8f1278d3b238bbf7a6832f4))



<a name="1.0.30"></a>
## [1.0.30](https://github.com/advanced-rest-client/arc-tools/compare/1.0.29...v1.0.30) (2016-09-29)


### New

* Added new options ([ee66fadc9294e82da8e40629ea0c8d30bb416853](https://github.com/advanced-rest-client/arc-tools/commit/ee66fadc9294e82da8e40629ea0c8d30bb416853))



<a name="1.0.29"></a>
## [1.0.29](https://github.com/advanced-rest-client/arc-tools/compare/1.0.28...v1.0.29) (2016-09-29)


### New

* Added new options ([930370bafeb70a4621154bac94d2807c8f90322e](https://github.com/advanced-rest-client/arc-tools/commit/930370bafeb70a4621154bac94d2807c8f90322e))



<a name="1.0.28"></a>
## [1.0.28](https://github.com/advanced-rest-client/arc-tools/compare/1.0.27...v1.0.28) (2016-09-29)


### New

* Added new options ([1cbfe609eca2b087751ae88b88c604d71eef2e45](https://github.com/advanced-rest-client/arc-tools/commit/1cbfe609eca2b087751ae88b88c604d71eef2e45))



<a name="1.0.27"></a>
## [1.0.27](https://github.com/advanced-rest-client/arc-tools/compare/1.0.26...v1.0.27) (2016-09-29)


### New

* Added new options ([4b63ac82c5bef80db34ac6ca53b568fde41d7f63](https://github.com/advanced-rest-client/arc-tools/commit/4b63ac82c5bef80db34ac6ca53b568fde41d7f63))



<a name="1.0.26"></a>
## [1.0.26](https://github.com/advanced-rest-client/arc-tools/compare/1.0.25...v1.0.26) (2016-09-29)


### New

* Added new options ([fbdadfc8890b2f7fde8ca98fb0aa44e0d0b7fefd](https://github.com/advanced-rest-client/arc-tools/commit/fbdadfc8890b2f7fde8ca98fb0aa44e0d0b7fefd))



<a name="1.0.25"></a>
## [1.0.25](https://github.com/advanced-rest-client/arc-tools/compare/1.0.24...v1.0.25) (2016-09-29)


### New

* Added new options ([616421cb3458829ccd7173d0deda45679108899f](https://github.com/advanced-rest-client/arc-tools/commit/616421cb3458829ccd7173d0deda45679108899f))



<a name="1.0.24"></a>
## [1.0.24](https://github.com/advanced-rest-client/arc-tools/compare/1.0.23...v1.0.24) (2016-09-29)


### New

* Added new options ([662f885ee0c2d2e18dbd56a1cd9e116e47bf1bbb](https://github.com/advanced-rest-client/arc-tools/commit/662f885ee0c2d2e18dbd56a1cd9e116e47bf1bbb))



<a name="1.0.23"></a>
## [1.0.23](https://github.com/advanced-rest-client/arc-tools/compare/1.0.20...v1.0.23) (2016-09-29)


### Fix

* Fixed structure command ([2b930675f4c4cedc198488f12ea9644ea16b2611](https://github.com/advanced-rest-client/arc-tools/commit/2b930675f4c4cedc198488f12ea9644ea16b2611))
* fixing CI command ([cf0654773069978edcec563e659558b65482306c](https://github.com/advanced-rest-client/arc-tools/commit/cf0654773069978edcec563e659558b65482306c))

### New

* Added master-release command ([a905667935ae5ac4d807e49a5caae46b21a978c2](https://github.com/advanced-rest-client/arc-tools/commit/a905667935ae5ac4d807e49a5caae46b21a978c2))



<a name="1.0.22"></a>
## [1.0.22](https://github.com/advanced-rest-client/arc-tools/compare/1.0.21...v1.0.22) (2016-09-28)


### Fix

* fixing CI command ([cf0654773069978edcec563e659558b65482306c](https://github.com/advanced-rest-client/arc-tools/commit/cf0654773069978edcec563e659558b65482306c))



<a name="1.0.21"></a>
## [1.0.21](https://github.com/advanced-rest-client/arc-tools/compare/1.0.19...v1.0.21) (2016-09-28)


### New

* Added master-release command ([a905667935ae5ac4d807e49a5caae46b21a978c2](https://github.com/advanced-rest-client/arc-tools/commit/a905667935ae5ac4d807e49a5caae46b21a978c2))
* Added repo command ([4533db16772854bae21d3a5f0f48a902a0866186](https://github.com/advanced-rest-client/arc-tools/commit/4533db16772854bae21d3a5f0f48a902a0866186))



<a name="1.0.20"></a>
## [1.0.20](https://github.com/advanced-rest-client/arc-tools/compare/1.0.5...v1.0.20) (2016-09-28)


### Fix

* Added ssh keys support ([d6c2dd19635eb362e6ac9d8170c51e7616c4277e](https://github.com/advanced-rest-client/arc-tools/commit/d6c2dd19635eb362e6ac9d8170c51e7616c4277e))
* Added ssh keys support ([0648d18c2e5d62c1028eeeb8088f18680eae96da](https://github.com/advanced-rest-client/arc-tools/commit/0648d18c2e5d62c1028eeeb8088f18680eae96da))
* fixed project doubled  dependencies ([f73f4e2fa742aded634327e92f9498d9a6b59656](https://github.com/advanced-rest-client/arc-tools/commit/f73f4e2fa742aded634327e92f9498d9a6b59656))
* Fixing dependencies ([b4d9086f52195763de96f464fb000d2c041a4a8b](https://github.com/advanced-rest-client/arc-tools/commit/b4d9086f52195763de96f464fb000d2c041a4a8b))
* Fixing dependencies ([e35471329b09a3923580674631e77a1a716d62cc](https://github.com/advanced-rest-client/arc-tools/commit/e35471329b09a3923580674631e77a1a716d62cc))
* Fixing dependencies ([08709183abd3493131b3b10eb00e3f7437617983](https://github.com/advanced-rest-client/arc-tools/commit/08709183abd3493131b3b10eb00e3f7437617983))
* Fixing dependencies ([7b8c498b2273c3ca2ffc258db4d10a5ba0fdb92b](https://github.com/advanced-rest-client/arc-tools/commit/7b8c498b2273c3ca2ffc258db4d10a5ba0fdb92b))
* Fixing dependencies ([fb75bc7a51031202ab7d2dd28957254b03d22879](https://github.com/advanced-rest-client/arc-tools/commit/fb75bc7a51031202ab7d2dd28957254b03d22879))
* fixing travis env variables usage ([c52b2b7e1abb29f9f066403adc49faef7a1bbb3d](https://github.com/advanced-rest-client/arc-tools/commit/c52b2b7e1abb29f9f066403adc49faef7a1bbb3d))

### New

* Added repo command ([4533db16772854bae21d3a5f0f48a902a0866186](https://github.com/advanced-rest-client/arc-tools/commit/4533db16772854bae21d3a5f0f48a902a0866186))
* Added stage command ([a7f2be36ab59534ded3a865aab2a2d0c17018914](https://github.com/advanced-rest-client/arc-tools/commit/a7f2be36ab59534ded3a865aab2a2d0c17018914))

### Update

* removed unused or redundant dependencies ([63e092907edbadec118f7be9a673082be21789aa](https://github.com/advanced-rest-client/arc-tools/commit/63e092907edbadec118f7be9a673082be21789aa))



<a name="1.0.19"></a>
## [1.0.19](https://github.com/advanced-rest-client/arc-tools/compare/1.0.18...v1.0.19) (2016-09-27)


### Fix

* Fixing dependencies ([b4d9086f52195763de96f464fb000d2c041a4a8b](https://github.com/advanced-rest-client/arc-tools/commit/b4d9086f52195763de96f464fb000d2c041a4a8b))



<a name="1.0.18"></a>
## [1.0.18](https://github.com/advanced-rest-client/arc-tools/compare/1.0.17...v1.0.18) (2016-09-27)


### Fix

* Fixing dependencies ([e35471329b09a3923580674631e77a1a716d62cc](https://github.com/advanced-rest-client/arc-tools/commit/e35471329b09a3923580674631e77a1a716d62cc))



<a name="1.0.17"></a>
## [1.0.17](https://github.com/advanced-rest-client/arc-tools/compare/1.0.16...v1.0.17) (2016-09-27)


### Fix

* Fixing dependencies ([08709183abd3493131b3b10eb00e3f7437617983](https://github.com/advanced-rest-client/arc-tools/commit/08709183abd3493131b3b10eb00e3f7437617983))



<a name="1.0.16"></a>
## [1.0.16](https://github.com/advanced-rest-client/arc-tools/compare/1.0.15...v1.0.16) (2016-09-27)


### Fix

* Fixing dependencies ([7b8c498b2273c3ca2ffc258db4d10a5ba0fdb92b](https://github.com/advanced-rest-client/arc-tools/commit/7b8c498b2273c3ca2ffc258db4d10a5ba0fdb92b))



<a name="1.0.15"></a>
## [1.0.15](https://github.com/advanced-rest-client/arc-tools/compare/1.0.14...v1.0.15) (2016-09-27)


### Fix

* Fixing dependencies ([fb75bc7a51031202ab7d2dd28957254b03d22879](https://github.com/advanced-rest-client/arc-tools/commit/fb75bc7a51031202ab7d2dd28957254b03d22879))



<a name="1.0.14"></a>
## [1.0.14](https://github.com/advanced-rest-client/arc-tools/compare/1.0.13...v1.0.14) (2016-09-27)




<a name="1.0.13"></a>
## [1.0.13](https://github.com/advanced-rest-client/arc-tools/compare/1.0.12...v1.0.13) (2016-09-27)




<a name="1.0.12"></a>
## [1.0.12](https://github.com/advanced-rest-client/arc-tools/compare/1.0.11...v1.0.12) (2016-09-27)




<a name="1.0.11"></a>
## [1.0.11](https://github.com/advanced-rest-client/arc-tools/compare/1.0.10...v1.0.11) (2016-09-27)




<a name="1.0.10"></a>
## [1.0.10](https://github.com/advanced-rest-client/arc-tools/compare/1.0.9...v1.0.10) (2016-09-27)


### Fix

* fixing travis env variables usage ([c52b2b7e1abb29f9f066403adc49faef7a1bbb3d](https://github.com/advanced-rest-client/arc-tools/commit/c52b2b7e1abb29f9f066403adc49faef7a1bbb3d))



<a name="1.0.9"></a>
## [1.0.9](https://github.com/advanced-rest-client/arc-tools/compare/1.0.8...v1.0.9) (2016-09-26)


### Fix

* Added ssh keys support ([d6c2dd19635eb362e6ac9d8170c51e7616c4277e](https://github.com/advanced-rest-client/arc-tools/commit/d6c2dd19635eb362e6ac9d8170c51e7616c4277e))



<a name="1.0.8"></a>
## [1.0.8](https://github.com/advanced-rest-client/arc-tools/compare/1.0.7...v1.0.8) (2016-09-26)


### Fix

* Added ssh keys support ([0648d18c2e5d62c1028eeeb8088f18680eae96da](https://github.com/advanced-rest-client/arc-tools/commit/0648d18c2e5d62c1028eeeb8088f18680eae96da))



<a name="1.0.7"></a>
## [1.0.7](https://github.com/advanced-rest-client/arc-tools/compare/1.0.6...v1.0.7) (2016-09-26)


### New

* Added stage command ([a7f2be36ab59534ded3a865aab2a2d0c17018914](https://github.com/advanced-rest-client/arc-tools/commit/a7f2be36ab59534ded3a865aab2a2d0c17018914))



<a name="1.0.6"></a>
## [1.0.6](https://github.com/advanced-rest-client/arc-tools/compare/1.0.4...v1.0.6) (2016-09-26)


### Fix

* Fixed GitHub API usare requirement to provide repo name as a User-Agent header ([1aedeb5008ee38e529a9fc648528c44903162abf](https://github.com/advanced-rest-client/arc-tools/commit/1aedeb5008ee38e529a9fc648528c44903162abf))
* fixed project doubled  dependencies ([f73f4e2fa742aded634327e92f9498d9a6b59656](https://github.com/advanced-rest-client/arc-tools/commit/f73f4e2fa742aded634327e92f9498d9a6b59656))

### New

* Added command to rebuild catalog's structure ([d6ba1e0100518eeb4f923b846e65405b8a172841](https://github.com/advanced-rest-client/arc-tools/commit/d6ba1e0100518eeb4f923b846e65405b8a172841))

### Update

* removed unused or redundant dependencies ([63e092907edbadec118f7be9a673082be21789aa](https://github.com/advanced-rest-client/arc-tools/commit/63e092907edbadec118f7be9a673082be21789aa))



<a name="1.0.5"></a>
## [1.0.5](https://github.com/advanced-rest-client/arc-tools/compare/1.0.1...v1.0.5) (2016-09-25)


### Fix

* Fixed double dependency entry ([ff855c2a6301945e6d2e90d2f6450471a973660c](https://github.com/advanced-rest-client/arc-tools/commit/ff855c2a6301945e6d2e90d2f6450471a973660c))
* Fixed GitHub API usare requirement to provide repo name as a User-Agent header ([1aedeb5008ee38e529a9fc648528c44903162abf](https://github.com/advanced-rest-client/arc-tools/commit/1aedeb5008ee38e529a9fc648528c44903162abf))

### New

* Added command to rebuild catalog's structure ([d6ba1e0100518eeb4f923b846e65405b8a172841](https://github.com/advanced-rest-client/arc-tools/commit/d6ba1e0100518eeb4f923b846e65405b8a172841))
* Added release builder ([61a812c1325d0923f8a7f057bd7417e269a9c678](https://github.com/advanced-rest-client/arc-tools/commit/61a812c1325d0923f8a7f057bd7417e269a9c678))

### Update

* Changed docs method, now it can work in a component directory ([1db9713f567c89a3a7def68ac87356541b326503](https://github.com/advanced-rest-client/arc-tools/commit/1db9713f567c89a3a7def68ac87356541b326503))



<a name="1.0.4"></a>
## [1.0.4](https://github.com/advanced-rest-client/arc-tools/compare/1.0.3...v1.0.4) (2016-09-23)


### Update

* Changed docs method, now it can work in a component directory ([1db9713f567c89a3a7def68ac87356541b326503](https://github.com/advanced-rest-client/arc-tools/commit/1db9713f567c89a3a7def68ac87356541b326503))



<a name="1.0.3"></a>
## [1.0.3](https://github.com/advanced-rest-client/arc-tools/compare/1.0.2...v1.0.3) (2016-09-22)




<a name="1.0.2"></a>
## [1.0.2](https://github.com/advanced-rest-client/arc-tools/compare/1.0.1...v1.0.2) (2016-09-20)


### Fix

* Fixed double dependency entry ([ff855c2a6301945e6d2e90d2f6450471a973660c](https://github.com/advanced-rest-client/arc-tools/commit/ff855c2a6301945e6d2e90d2f6450471a973660c))

### New

* Added release builder ([61a812c1325d0923f8a7f057bd7417e269a9c678](https://github.com/advanced-rest-client/arc-tools/commit/61a812c1325d0923f8a7f057bd7417e269a9c678))



<a name="1.0.1"></a>
## 1.0.1 (2016-09-11)


### Breaking

* Change in the API ([8bc3a8607fce51c8298aa6a3a9a81d499e4673d1](https://github.com/advanced-rest-client/arc-tools/commit/8bc3a8607fce51c8298aa6a3a9a81d499e4673d1))

### New

* Added new commands ([0221c132fbd2e6b74c65e146f3f777a90dae3c22](https://github.com/advanced-rest-client/arc-tools/commit/0221c132fbd2e6b74c65e146f3f777a90dae3c22))



<a name="1.0.7"></a>
## [1.0.7](https://github.com/advanced-rest-client/polymd/compare/1.0.6...v1.0.7) (2016-09-10)


### Fix

* Fixed repository path when the repository field is present ([3a2db56b80a47e0ffe767e9a4599c6c4f93f6272](https://github.com/advanced-rest-client/polymd/commit/3a2db56b80a47e0ffe767e9a4599c6c4f93f6272))



<a name="1.0.6"></a>
## [1.0.6](https://github.com/advanced-rest-client/polymd/compare/1.0.5...v1.0.6) (2016-09-10)


### Fix

* Fixed component documentation by adding a default component to show in startup ([f9a072acfb62e8de35f1691ba1873da69183f96e](https://github.com/advanced-rest-client/polymd/commit/f9a072acfb62e8de35f1691ba1873da69183f96e))
* Fixed repository path when the reporitory option is specified ([6195924eb349156e7733676155f210852f4b91cc](https://github.com/advanced-rest-client/polymd/commit/6195924eb349156e7733676155f210852f4b91cc))

### Update

* Added an example to component's docs ([491900199273a2b9023efb7286749bfa8fb319b0](https://github.com/advanced-rest-client/polymd/commit/491900199273a2b9023efb7286749bfa8fb319b0))



<a name="1.0.5"></a>
## [1.0.5](https://github.com/advanced-rest-client/polymd/compare/v1.0.4...v1.0.5) (2016-09-06)




