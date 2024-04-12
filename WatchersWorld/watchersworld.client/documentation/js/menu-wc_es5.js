'use strict';

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }
function _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _isNativeFunction(fn) { try { return Function.toString.call(fn).indexOf("[native code]") !== -1; } catch (e) { return typeof fn === "function"; } }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
customElements.define('compodoc-menu', /*#__PURE__*/function (_HTMLElement) {
  function _class() {
    var _this;
    _classCallCheck(this, _class);
    _this = _callSuper(this, _class);
    _this.isNormalMode = _this.getAttribute('mode') === 'normal';
    return _this;
  }
  _inherits(_class, _HTMLElement);
  return _createClass(_class, [{
    key: "connectedCallback",
    value: function connectedCallback() {
      this.render(this.isNormalMode);
    }
  }, {
    key: "render",
    value: function render(isNormalMode) {
      var tp = lithtml.html("\n        <nav>\n            <ul class=\"list\">\n                <li class=\"title\">\n                    <a href=\"index.html\" data-type=\"index-link\">watchersworld.client documentation</a>\n                </li>\n\n                <li class=\"divider\"></li>\n                ".concat(isNormalMode ? "<div id=\"book-search-input\" role=\"search\"><input type=\"text\" placeholder=\"Type to search\"></div>" : '', "\n                <li class=\"chapter\">\n                    <a data-type=\"chapter-link\" href=\"index.html\"><span class=\"icon ion-ios-home\"></span>Getting started</a>\n                    <ul class=\"links\">\n                        <li class=\"link\">\n                            <a href=\"overview.html\" data-type=\"chapter-link\">\n                                <span class=\"icon ion-ios-keypad\"></span>Overview\n                            </a>\n                        </li>\n                        <li class=\"link\">\n                            <a href=\"index.html\" data-type=\"chapter-link\">\n                                <span class=\"icon ion-ios-paper\"></span>README\n                            </a>\n                        </li>\n                                <li class=\"link\">\n                                    <a href=\"dependencies.html\" data-type=\"chapter-link\">\n                                        <span class=\"icon ion-ios-list\"></span>Dependencies\n                                    </a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"properties.html\" data-type=\"chapter-link\">\n                                        <span class=\"icon ion-ios-apps\"></span>Properties\n                                    </a>\n                                </li>\n                    </ul>\n                </li>\n                    <li class=\"chapter modules\">\n                        <a data-type=\"chapter-link\" href=\"modules.html\">\n                            <div class=\"menu-toggler linked\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"', ">\n                                <span class=\"icon ion-ios-archive\"></span>\n                                <span class=\"link-name\">Modules</span>\n                                <span class=\"icon ion-ios-arrow-down\"></span>\n                            </div>\n                        </a>\n                        <ul class=\"links collapse \" ").concat(isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"', ">\n                            <li class=\"link\">\n                                <a href=\"modules/AppModule.html\" data-type=\"entity-link\" >AppModule</a>\n                                    <li class=\"chapter inner\">\n                                        <div class=\"simple menu-toggler\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#components-links-module-AppModule-a3f89b8459cb890a1ea40e7e7257f4825783c56e41f8e6c237e88b80d513e4d606f246eec682972eadee512b84b218a7098159883d84ca11a0aa7bc36f1b3d13"' : 'data-bs-target="#xs-components-links-module-AppModule-a3f89b8459cb890a1ea40e7e7257f4825783c56e41f8e6c237e88b80d513e4d606f246eec682972eadee512b84b218a7098159883d84ca11a0aa7bc36f1b3d13"', ">\n                                            <span class=\"icon ion-md-cog\"></span>\n                                            <span>Components</span>\n                                            <span class=\"icon ion-ios-arrow-down\"></span>\n                                        </div>\n                                        <ul class=\"links collapse\" ").concat(isNormalMode ? 'id="components-links-module-AppModule-a3f89b8459cb890a1ea40e7e7257f4825783c56e41f8e6c237e88b80d513e4d606f246eec682972eadee512b84b218a7098159883d84ca11a0aa7bc36f1b3d13"' : 'id="xs-components-links-module-AppModule-a3f89b8459cb890a1ea40e7e7257f4825783c56e41f8e6c237e88b80d513e4d606f246eec682972eadee512b84b218a7098159883d84ca11a0aa7bc36f1b3d13"', ">\n                                            <li class=\"link\">\n                                                <a href=\"components/AboutUsComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >AboutUsComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/AdminComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >AdminComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/AdminStatisticsComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >AdminStatisticsComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/AllMoviesPageComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >AllMoviesPageComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/AllSeriesPageComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >AllSeriesPageComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/AppComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >AppComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/ChatComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >ChatComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/ConfirmDialogComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >ConfirmDialogComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/EditProfileComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >EditProfileComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/FooterComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >FooterComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/GamificationComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >GamificationComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/HomeComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >HomeComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/LoadingComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >LoadingComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/MovieDetailsComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >MovieDetailsComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/NavMenuComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >NavMenuComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/NotificationsComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >NotificationsComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/ProfileComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >ProfileComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/SearchComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >SearchComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/SearchServiceComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >SearchServiceComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/SeasonDetailsComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >SeasonDetailsComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/SeasonDetailsInfoComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >SeasonDetailsInfoComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/SeriesDetailsComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >SeriesDetailsComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/StatisticsComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >StatisticsComponent</a>\n                                            </li>\n                                        </ul>\n                                    </li>\n                                <li class=\"chapter inner\">\n                                    <div class=\"simple menu-toggler\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#injectables-links-module-AppModule-a3f89b8459cb890a1ea40e7e7257f4825783c56e41f8e6c237e88b80d513e4d606f246eec682972eadee512b84b218a7098159883d84ca11a0aa7bc36f1b3d13"' : 'data-bs-target="#xs-injectables-links-module-AppModule-a3f89b8459cb890a1ea40e7e7257f4825783c56e41f8e6c237e88b80d513e4d606f246eec682972eadee512b84b218a7098159883d84ca11a0aa7bc36f1b3d13"', ">\n                                        <span class=\"icon ion-md-arrow-round-down\"></span>\n                                        <span>Injectables</span>\n                                        <span class=\"icon ion-ios-arrow-down\"></span>\n                                    </div>\n                                    <ul class=\"links collapse\" ").concat(isNormalMode ? 'id="injectables-links-module-AppModule-a3f89b8459cb890a1ea40e7e7257f4825783c56e41f8e6c237e88b80d513e4d606f246eec682972eadee512b84b218a7098159883d84ca11a0aa7bc36f1b3d13"' : 'id="xs-injectables-links-module-AppModule-a3f89b8459cb890a1ea40e7e7257f4825783c56e41f8e6c237e88b80d513e4d606f246eec682972eadee512b84b218a7098159883d84ca11a0aa7bc36f1b3d13"', ">\n                                        <li class=\"link\">\n                                            <a href=\"injectables/ChatService.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >ChatService</a>\n                                        </li>\n                                        <li class=\"link\">\n                                            <a href=\"injectables/DialogService.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >DialogService</a>\n                                        </li>\n                                        <li class=\"link\">\n                                            <a href=\"injectables/MovieApiServiceComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >MovieApiServiceComponent</a>\n                                        </li>\n                                    </ul>\n                                </li>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"modules/AppRoutingModule.html\" data-type=\"entity-link\" >AppRoutingModule</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"modules/AuthenticationModule.html\" data-type=\"entity-link\" >AuthenticationModule</a>\n                                    <li class=\"chapter inner\">\n                                        <div class=\"simple menu-toggler\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#components-links-module-AuthenticationModule-d2edb6e9462187a3502a6d94401d40ba1bea2bf01c6a094952c6ad733c8cd8cc1dd8b4fb2f7ff08f5b4e7428ff9ad0dc6f31fdba479f68cede2009cda47df22b"' : 'data-bs-target="#xs-components-links-module-AuthenticationModule-d2edb6e9462187a3502a6d94401d40ba1bea2bf01c6a094952c6ad733c8cd8cc1dd8b4fb2f7ff08f5b4e7428ff9ad0dc6f31fdba479f68cede2009cda47df22b"', ">\n                                            <span class=\"icon ion-md-cog\"></span>\n                                            <span>Components</span>\n                                            <span class=\"icon ion-ios-arrow-down\"></span>\n                                        </div>\n                                        <ul class=\"links collapse\" ").concat(isNormalMode ? 'id="components-links-module-AuthenticationModule-d2edb6e9462187a3502a6d94401d40ba1bea2bf01c6a094952c6ad733c8cd8cc1dd8b4fb2f7ff08f5b4e7428ff9ad0dc6f31fdba479f68cede2009cda47df22b"' : 'id="xs-components-links-module-AuthenticationModule-d2edb6e9462187a3502a6d94401d40ba1bea2bf01c6a094952c6ad733c8cd8cc1dd8b4fb2f7ff08f5b4e7428ff9ad0dc6f31fdba479f68cede2009cda47df22b"', ">\n                                            <li class=\"link\">\n                                                <a href=\"components/AuthenticationButtonComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >AuthenticationButtonComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/BlockedAccountComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >BlockedAccountComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/LoginComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >LoginComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/PendingVerificationComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >PendingVerificationComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/RegisterWithThirdPartyComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >RegisterWithThirdPartyComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/RegistrationComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >RegistrationComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/ResetPasswordComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >ResetPasswordComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/SendEmailComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >SendEmailComponent</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"components/SuspendedAccountComponent.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >SuspendedAccountComponent</a>\n                                            </li>\n                                        </ul>\n                                    </li>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"modules/AuthenticationRoutingModule.html\" data-type=\"entity-link\" >AuthenticationRoutingModule</a>\n                            </li>\n                </ul>\n                </li>\n                    <li class=\"chapter\">\n                        <div class=\"simple menu-toggler\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#classes-links"' : 'data-bs-target="#xs-classes-links"', ">\n                            <span class=\"icon ion-ios-paper\"></span>\n                            <span>Classes</span>\n                            <span class=\"icon ion-ios-arrow-down\"></span>\n                        </div>\n                        <ul class=\"links collapse \" ").concat(isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"', ">\n                            <li class=\"link\">\n                                <a href=\"classes/AchievementNotificationModel.html\" data-type=\"entity-link\" >AchievementNotificationModel</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/Actor.html\" data-type=\"entity-link\" >Actor</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/FavoriteActor.html\" data-type=\"entity-link\" >FavoriteActor</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/FollowerProfile.html\" data-type=\"entity-link\" >FollowerProfile</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/FollowNotificationModel.html\" data-type=\"entity-link\" >FollowNotificationModel</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/LoginWithExternal.html\" data-type=\"entity-link\" >LoginWithExternal</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/MediaNotificationModel.html\" data-type=\"entity-link\" >MediaNotificationModel</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/MessageNotificationModel.html\" data-type=\"entity-link\" >MessageNotificationModel</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/NotificationModel.html\" data-type=\"entity-link\" >NotificationModel</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/Profile.html\" data-type=\"entity-link\" >Profile</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/RegisterWithExternal.html\" data-type=\"entity-link\" >RegisterWithExternal</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/ReplyNotificationModel.html\" data-type=\"entity-link\" >ReplyNotificationModel</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"classes/User.html\" data-type=\"entity-link\" >User</a>\n                            </li>\n                        </ul>\n                    </li>\n                        <li class=\"chapter\">\n                            <div class=\"simple menu-toggler\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#injectables-links"' : 'data-bs-target="#xs-injectables-links"', ">\n                                <span class=\"icon ion-md-arrow-round-down\"></span>\n                                <span>Injectables</span>\n                                <span class=\"icon ion-ios-arrow-down\"></span>\n                            </div>\n                            <ul class=\"links collapse \" ").concat(isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"', ">\n                                <li class=\"link\">\n                                    <a href=\"injectables/AdminService.html\" data-type=\"entity-link\" >AdminService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/AuthenticationService.html\" data-type=\"entity-link\" >AuthenticationService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/AuthorizationGuard.html\" data-type=\"entity-link\" >AuthorizationGuard</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/ChatService.html\" data-type=\"entity-link\" >ChatService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/DialogService.html\" data-type=\"entity-link\" >DialogService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/GamificationService.html\" data-type=\"entity-link\" >GamificationService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/LoadingService.html\" data-type=\"entity-link\" >LoadingService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/MovieApiServiceComponent.html\" data-type=\"entity-link\" >MovieApiServiceComponent</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/NotificationService.html\" data-type=\"entity-link\" >NotificationService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/ProfileService.html\" data-type=\"entity-link\" >ProfileService</a>\n                                </li>\n                            </ul>\n                        </li>\n                    <li class=\"chapter\">\n                        <div class=\"simple menu-toggler\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#interceptors-links"' : 'data-bs-target="#xs-interceptors-links"', ">\n                            <span class=\"icon ion-ios-swap\"></span>\n                            <span>Interceptors</span>\n                            <span class=\"icon ion-ios-arrow-down\"></span>\n                        </div>\n                        <ul class=\"links collapse \" ").concat(isNormalMode ? 'id="interceptors-links"' : 'id="xs-interceptors-links"', ">\n                            <li class=\"link\">\n                                <a href=\"interceptors/JwtInterceptor.html\" data-type=\"entity-link\" >JwtInterceptor</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interceptors/LoadingInterceptor.html\" data-type=\"entity-link\" >LoadingInterceptor</a>\n                            </li>\n                        </ul>\n                    </li>\n                    <li class=\"chapter\">\n                        <div class=\"simple menu-toggler\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#interfaces-links"' : 'data-bs-target="#xs-interfaces-links"', ">\n                            <span class=\"icon ion-md-information-circle-outline\"></span>\n                            <span>Interfaces</span>\n                            <span class=\"icon ion-ios-arrow-down\"></span>\n                        </div>\n                        <ul class=\"links collapse \" ").concat(isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"', ">\n                            <li class=\"link\">\n                                <a href=\"interfaces/ChatWithMessages.html\" data-type=\"entity-link\" >ChatWithMessages</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/ConfirmEmail.html\" data-type=\"entity-link\" >ConfirmEmail</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/Login.html\" data-type=\"entity-link\" >Login</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/MedalsDto.html\" data-type=\"entity-link\" >MedalsDto</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/Message.html\" data-type=\"entity-link\" >Message</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/MovieCategory.html\" data-type=\"entity-link\" >MovieCategory</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/MovieCategory-1.html\" data-type=\"entity-link\" >MovieCategory</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/MovieCategory-2.html\" data-type=\"entity-link\" >MovieCategory</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/MovieCategory-3.html\" data-type=\"entity-link\" >MovieCategory</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/ProfileChat.html\" data-type=\"entity-link\" >ProfileChat</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/Register.html\" data-type=\"entity-link\" >Register</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/ResetPassword.html\" data-type=\"entity-link\" >ResetPassword</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/UserMedia.html\" data-type=\"entity-link\" >UserMedia</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/UserRatingMedia.html\" data-type=\"entity-link\" >UserRatingMedia</a>\n                            </li>\n                        </ul>\n                    </li>\n                    <li class=\"chapter\">\n                        <div class=\"simple menu-toggler\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#miscellaneous-links"' : 'data-bs-target="#xs-miscellaneous-links"', ">\n                            <span class=\"icon ion-ios-cube\"></span>\n                            <span>Miscellaneous</span>\n                            <span class=\"icon ion-ios-arrow-down\"></span>\n                        </div>\n                        <ul class=\"links collapse \" ").concat(isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"', ">\n                            <li class=\"link\">\n                                <a href=\"miscellaneous/variables.html\" data-type=\"entity-link\">Variables</a>\n                            </li>\n                        </ul>\n                    </li>\n                        <li class=\"chapter\">\n                            <a data-type=\"chapter-link\" href=\"routes.html\"><span class=\"icon ion-ios-git-branch\"></span>Routes</a>\n                        </li>\n                    <li class=\"chapter\">\n                        <a data-type=\"chapter-link\" href=\"coverage.html\"><span class=\"icon ion-ios-stats\"></span>Documentation coverage</a>\n                    </li>\n                    <li class=\"divider\"></li>\n                    <li class=\"copyright\">\n                        Documentation generated using <a href=\"https://compodoc.app/\" target=\"_blank\" rel=\"noopener noreferrer\">\n                            <img data-src=\"images/compodoc-vectorise.png\" class=\"img-responsive\" data-type=\"compodoc-logo\">\n                        </a>\n                    </li>\n            </ul>\n        </nav>\n        "));
      this.innerHTML = tp.strings;
    }
  }]);
}( /*#__PURE__*/_wrapNativeSuper(HTMLElement)));