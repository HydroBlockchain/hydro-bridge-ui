import {chainIDs} from '../common/common'
import {ThunkAction} from 'redux-thunk'
import {AppStoreType} from './store'
import {BridgeActionTypes} from './bridgeReducer'

const isTestNetsLS = localStorage.getItem('isTestNets')
let initialState = {
    status: 'idle' as RequestStatusType,
    isTestNets: isTestNetsLS ? JSON.parse(isTestNetsLS) : false,
    isSwapButtonDisabled: true,
    isSupportedChain: false,
    isSwapperClicked: false, // this is for solve async problem with native balance after swapping
    errorMessage: ''
}

export const appReducer = (state: AppStateType = initialState, action: ActionsType): AppStateType => {
    switch (action.type) {
        case 'APP/SET-STATUS':
        case 'APP/SET-IS-TEST-NETS':
        case 'APP/SET-IS-SWAP-BUTTON-DISABLED':
        case 'APP/SET-IS-SUPPORTED-CHAIN':
        case 'APP/SET-IS-SWAPPER-CLICKED':
        case 'APP/SET-ERROR-MESSAGE':
            return {...state, ...action.payload}
        default:
            return {...state}
    }
}

export const setAppStatusAC = (status: RequestStatusType) => ({type: 'APP/SET-STATUS', payload: {status}} as const)
export const setIsTestNetsAC = (isTestNets: boolean) => ({type: 'APP/SET-IS-TEST-NETS', payload: {isTestNets}} as const)
export const setSwapButtonDisabledAC = (isSwapButtonDisabled: boolean) => ({
    type: 'APP/SET-IS-SWAP-BUTTON-DISABLED',
    payload: {isSwapButtonDisabled}
} as const)
// if selected in Metamask chain is not supported in application
export const setIsSupportedChainAC = (isSupportedChain: boolean) => ({
    type: 'APP/SET-IS-SUPPORTED-CHAIN',
    payload: {isSupportedChain}
} as const)
export const setIsSwapperClickedAC = (isSwapperClicked: boolean) => ({
    type: 'APP/SET-IS-SWAPPER-CLICKED',
    payload: {isSwapperClicked}
} as const)
export const setErrorMessageAC = (errorMessage: string) => ({
    type: 'APP/SET-ERROR-MESSAGE',
    payload: {errorMessage}
})

// Types
export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'
export type AppStateType = typeof initialState
type ActionsType =
    | ReturnType<typeof setAppStatusAC>
    | ReturnType<typeof setIsTestNetsAC>
    | ReturnType<typeof setSwapButtonDisabledAC>
    | ReturnType<typeof setIsSupportedChainAC>
    | ReturnType<typeof setIsSwapperClickedAC>
    | ReturnType<typeof setErrorMessageAC>

type AppThunk = ThunkAction<void, AppStoreType, unknown, ActionsType>