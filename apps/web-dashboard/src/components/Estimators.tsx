'use client';

import styles from './Estimators.module.css';
import { PiEqualsThin } from "react-icons/pi";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";


interface Props {
    value: number;
}

export default function Estimator({ value }: Props) {
    const icon =
        value > 0 ? <IoIosArrowUp /> : value < 0 ? <IoIosArrowDown /> : "=";
    const colorClass =
        value > 0 ? styles.positive : value < 0 ? styles.negative : styles.neutral;

    return (
        <p className={`${styles.estimator} ${colorClass}`}>
            {icon} {Math.abs(value).toFixed(1)}%
        </p>
    );
}
