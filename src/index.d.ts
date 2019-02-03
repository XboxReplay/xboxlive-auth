import {
    IAuthUserResponse as IResponse,
    IUserCredentials as ICredentials
} from './__typings__';

export namespace XboxLiveAuth {
    export { IResponse as IAuthUserResponse };
    export { ICredentials as IUserCredentials };
    export function authenticate(
        email: string,
        password: string
    ): Promise<IResponse>;
}
