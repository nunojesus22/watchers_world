'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">watchersworld.client documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-AppModule-a3f89b8459cb890a1ea40e7e7257f4825783c56e41f8e6c237e88b80d513e4d606f246eec682972eadee512b84b218a7098159883d84ca11a0aa7bc36f1b3d13"' : 'data-bs-target="#xs-components-links-module-AppModule-a3f89b8459cb890a1ea40e7e7257f4825783c56e41f8e6c237e88b80d513e4d606f246eec682972eadee512b84b218a7098159883d84ca11a0aa7bc36f1b3d13"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-a3f89b8459cb890a1ea40e7e7257f4825783c56e41f8e6c237e88b80d513e4d606f246eec682972eadee512b84b218a7098159883d84ca11a0aa7bc36f1b3d13"' :
                                            'id="xs-components-links-module-AppModule-a3f89b8459cb890a1ea40e7e7257f4825783c56e41f8e6c237e88b80d513e4d606f246eec682972eadee512b84b218a7098159883d84ca11a0aa7bc36f1b3d13"' }>
                                            <li class="link">
                                                <a href="components/AboutUsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AboutUsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AdminComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AdminStatisticsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminStatisticsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AllMoviesPageComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AllMoviesPageComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AllSeriesPageComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AllSeriesPageComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AppComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ChatComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ChatComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ConfirmDialogComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ConfirmDialogComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditProfileComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EditProfileComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FooterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FooterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GamificationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GamificationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HomeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HomeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LoadingComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LoadingComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MovieDetailsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MovieDetailsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/NavMenuComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NavMenuComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/NotificationsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NotificationsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProfileComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProfileComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SearchComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SearchComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SearchServiceComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SearchServiceComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SeasonDetailsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SeasonDetailsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SeasonDetailsInfoComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SeasonDetailsInfoComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SeriesDetailsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SeriesDetailsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StatisticsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StatisticsComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppModule-a3f89b8459cb890a1ea40e7e7257f4825783c56e41f8e6c237e88b80d513e4d606f246eec682972eadee512b84b218a7098159883d84ca11a0aa7bc36f1b3d13"' : 'data-bs-target="#xs-injectables-links-module-AppModule-a3f89b8459cb890a1ea40e7e7257f4825783c56e41f8e6c237e88b80d513e4d606f246eec682972eadee512b84b218a7098159883d84ca11a0aa7bc36f1b3d13"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-a3f89b8459cb890a1ea40e7e7257f4825783c56e41f8e6c237e88b80d513e4d606f246eec682972eadee512b84b218a7098159883d84ca11a0aa7bc36f1b3d13"' :
                                        'id="xs-injectables-links-module-AppModule-a3f89b8459cb890a1ea40e7e7257f4825783c56e41f8e6c237e88b80d513e4d606f246eec682972eadee512b84b218a7098159883d84ca11a0aa7bc36f1b3d13"' }>
                                        <li class="link">
                                            <a href="injectables/ChatService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ChatService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/DialogService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DialogService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/MovieApiServiceComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MovieApiServiceComponent</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppRoutingModule.html" data-type="entity-link" >AppRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AuthenticationModule.html" data-type="entity-link" >AuthenticationModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-AuthenticationModule-d2edb6e9462187a3502a6d94401d40ba1bea2bf01c6a094952c6ad733c8cd8cc1dd8b4fb2f7ff08f5b4e7428ff9ad0dc6f31fdba479f68cede2009cda47df22b"' : 'data-bs-target="#xs-components-links-module-AuthenticationModule-d2edb6e9462187a3502a6d94401d40ba1bea2bf01c6a094952c6ad733c8cd8cc1dd8b4fb2f7ff08f5b4e7428ff9ad0dc6f31fdba479f68cede2009cda47df22b"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AuthenticationModule-d2edb6e9462187a3502a6d94401d40ba1bea2bf01c6a094952c6ad733c8cd8cc1dd8b4fb2f7ff08f5b4e7428ff9ad0dc6f31fdba479f68cede2009cda47df22b"' :
                                            'id="xs-components-links-module-AuthenticationModule-d2edb6e9462187a3502a6d94401d40ba1bea2bf01c6a094952c6ad733c8cd8cc1dd8b4fb2f7ff08f5b4e7428ff9ad0dc6f31fdba479f68cede2009cda47df22b"' }>
                                            <li class="link">
                                                <a href="components/AuthenticationButtonComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthenticationButtonComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BlockedAccountComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BlockedAccountComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LoginComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LoginComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PendingVerificationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PendingVerificationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RegisterWithThirdPartyComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RegisterWithThirdPartyComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RegistrationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RegistrationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ResetPasswordComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ResetPasswordComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SendEmailComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SendEmailComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SuspendedAccountComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SuspendedAccountComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthenticationRoutingModule.html" data-type="entity-link" >AuthenticationRoutingModule</a>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/AchievementNotificationModel.html" data-type="entity-link" >AchievementNotificationModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/Actor.html" data-type="entity-link" >Actor</a>
                            </li>
                            <li class="link">
                                <a href="classes/FavoriteActor.html" data-type="entity-link" >FavoriteActor</a>
                            </li>
                            <li class="link">
                                <a href="classes/FollowerProfile.html" data-type="entity-link" >FollowerProfile</a>
                            </li>
                            <li class="link">
                                <a href="classes/FollowNotificationModel.html" data-type="entity-link" >FollowNotificationModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginWithExternal.html" data-type="entity-link" >LoginWithExternal</a>
                            </li>
                            <li class="link">
                                <a href="classes/MediaNotificationModel.html" data-type="entity-link" >MediaNotificationModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/MessageNotificationModel.html" data-type="entity-link" >MessageNotificationModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/NotificationModel.html" data-type="entity-link" >NotificationModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/Profile.html" data-type="entity-link" >Profile</a>
                            </li>
                            <li class="link">
                                <a href="classes/RegisterWithExternal.html" data-type="entity-link" >RegisterWithExternal</a>
                            </li>
                            <li class="link">
                                <a href="classes/ReplyNotificationModel.html" data-type="entity-link" >ReplyNotificationModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/User.html" data-type="entity-link" >User</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AdminService.html" data-type="entity-link" >AdminService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthenticationService.html" data-type="entity-link" >AuthenticationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthorizationGuard.html" data-type="entity-link" >AuthorizationGuard</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ChatService.html" data-type="entity-link" >ChatService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DialogService.html" data-type="entity-link" >DialogService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GamificationService.html" data-type="entity-link" >GamificationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LoadingService.html" data-type="entity-link" >LoadingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MovieApiServiceComponent.html" data-type="entity-link" >MovieApiServiceComponent</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NotificationService.html" data-type="entity-link" >NotificationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProfileService.html" data-type="entity-link" >ProfileService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interceptors-links"' :
                            'data-bs-target="#xs-interceptors-links"' }>
                            <span class="icon ion-ios-swap"></span>
                            <span>Interceptors</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="interceptors-links"' : 'id="xs-interceptors-links"' }>
                            <li class="link">
                                <a href="interceptors/JwtInterceptor.html" data-type="entity-link" >JwtInterceptor</a>
                            </li>
                            <li class="link">
                                <a href="interceptors/LoadingInterceptor.html" data-type="entity-link" >LoadingInterceptor</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/ChatWithMessages.html" data-type="entity-link" >ChatWithMessages</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ConfirmEmail.html" data-type="entity-link" >ConfirmEmail</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Login.html" data-type="entity-link" >Login</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MedalsDto.html" data-type="entity-link" >MedalsDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Message.html" data-type="entity-link" >Message</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MovieCategory.html" data-type="entity-link" >MovieCategory</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MovieCategory-1.html" data-type="entity-link" >MovieCategory</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MovieCategory-2.html" data-type="entity-link" >MovieCategory</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MovieCategory-3.html" data-type="entity-link" >MovieCategory</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProfileChat.html" data-type="entity-link" >ProfileChat</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Register.html" data-type="entity-link" >Register</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ResetPassword.html" data-type="entity-link" >ResetPassword</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserMedia.html" data-type="entity-link" >UserMedia</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserRatingMedia.html" data-type="entity-link" >UserRatingMedia</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});