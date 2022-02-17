import React, {useEffect, useState} from "react";
import s from "./NetworkElement.module.scss";
import Select, {PropsValue, StylesConfig} from "react-select";
import {useDispatch} from "react-redux";
import {changeNetwork} from "../../../redux/bridge-reducer";

const options = [
    {value: 'eth', label: 'Ethereum'},
    {value: 'bsc', label: 'Binance Smart Chain'},
    {value: 'polygon', label: 'Polygon'},
    {value: 'csc', label: 'Coinex Smart Chain'}
]

const elementColor = '#313647'
const selectByArrowColor = '#203147'

const selectStyles: StylesConfig = {
    control: base => ({
        ...base,
        backgroundColor: elementColor,
    }),
    singleValue: base => ({
        ...base,
        color: 'white'
    }),
    menuList: base => ({
        ...base,
        backgroundColor: elementColor,
    }),
    option: (base, {isSelected, isFocused}) => ({
        ...base,
        backgroundColor: isSelected ? selectByArrowColor : isFocused ? selectByArrowColor : elementColor,
        ":hover": {
            ...base[':hover'],
            backgroundColor: '#4E5260'
        },
    }),
}

export const NetworkElement = (props: PropsType) => {
    const dispatch = useDispatch()
    const [state, setState] = useState("")
    useEffect(() => {
        if (state !== '') dispatch(changeNetwork(state))
    },[state])

    const onChange = (option: PropsValue<Option | Option[]>) => {
        setState((option as Option).value);
    }

    const getValue = () => {
        if (options) {
            return options.find((option) => option.value === state);
        } else {
            // todo: fix any
            return '' as any
        }
    };

    return <div className={s.networkElement}>
        <span>{props.text}</span>
        <div className={s.item}>
            <div className={s.tempCircle}/>
            <Select
                options={options}
                styles={selectStyles}
                name={"select"}
                onChange={onChange}
                placeholder={"Select Network"}
                value={getValue()}
            />
        </div>
    </div>
}

interface Option {
    label: string;
    value: string;
}
type PropsType = {
    text: string
}