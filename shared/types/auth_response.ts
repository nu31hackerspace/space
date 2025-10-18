export type AuthResponse = AuthSuccessResponse | AuthFailureResponse

export interface AuthSuccessResponse {
    success: true
    user: {
        id: string
        name: string
        username: string
    }
}

export interface AuthFailureResponse {
    success: false
    errorCode: number
    errorMessage: string
    stepStatus: {
        step1Complete: boolean // User is in Discord server
        step2Complete: boolean // User has required role
    }
}

