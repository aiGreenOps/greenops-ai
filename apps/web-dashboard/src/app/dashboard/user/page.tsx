import styles from './dashboard.module.css';
import { LuThermometerSun, LuDroplets, LuLeaf } from "react-icons/lu";
import { FaRegLightbulb } from "react-icons/fa";
import Estimator from '@/components/Estimators';


export default function UserDashboardPage() {
    return (
        <div className={styles.wrapper}>
            <div className={styles.firstContainer}>
                <div className={styles.sensorParameters}>
                    <div className={`${styles.iconParameter} ${styles.temp}`}>
                        <LuThermometerSun />
                    </div>
                    <div className={styles.parameterInfo}>
                        <p className={styles.parameterName}>Average Temperature</p>
                        <div className={styles.parameterValue}>
                            <p className={styles.value}>24.5 °C</p>
                            <Estimator value={2.3} />
                        </div>
                    </div>
                </div>
                <div className={styles.sensorParameters}>
                    <div className={`${styles.iconParameter} ${styles.hum}`}>
                        <LuDroplets />
                    </div>
                    <div className={styles.parameterInfo}>
                        <p className={styles.parameterName}>Average Humidity</p>
                        <div className={styles.parameterValue}>
                            <p className={styles.value}>68.2 %</p>
                            <Estimator value={-1.5} />
                        </div>
                    </div>
                </div>
                <div className={styles.sensorParameters}>
                    <div className={`${styles.iconParameter} ${styles.soil}`}>
                        <LuLeaf />
                    </div>
                    <div className={styles.parameterInfo}>
                        <p className={styles.parameterName}>Soil Moisture</p>
                        <div className={styles.parameterValue}>
                            <p className={styles.value}>42.7 %</p>
                            <Estimator value={3.8} />
                        </div>
                    </div>
                </div>
                <div className={styles.sensorParameters}>
                    <div className={`${styles.iconParameter} ${styles.brigh}`}>
                        <FaRegLightbulb />
                    </div>
                    <div className={styles.parameterInfo}>
                        <p className={styles.parameterName}>Solar Brightness</p>
                        <div className={styles.parameterValue}>
                            <p className={styles.value}>62.3 %</p>
                            <Estimator value={0} />
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.secondContainer}>
            </div>
            <div className={styles.thirdContainer}>
            </div>
        </div>
    );
}
