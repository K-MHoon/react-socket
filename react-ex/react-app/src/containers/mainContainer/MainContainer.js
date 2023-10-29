import dayjs from "dayjs";
import styles from "./MainContainer.module.css";
import React, { useState } from "react";
import { MdPlaylistAdd } from "react-icons/md";
import Goal from "../../components/goal/Goal";
import Input from "../../components/input/Input";

const MainContainer = () => {
    const [memoData, setMemoData] = useState(new Map());
    const [currentDate, setCurrentDate] = useState("");
    const [goalMsg, setGoalMsg] = useState("");

    const onAddDateHandler = () => {
        const tempCurrentDate = dayjs().format("YYYY.MM.DD HH:mm:ss");
        if (memoData.has(tempCurrentDate)) return;
        setCurrentDate(tempCurrentDate);
        setMemoData((prev) => new Map(prev).set(tempCurrentDate, []));
    };

    const onDateClick = (e) => {
        const { id } = e.target.dataset;
        setCurrentDate(id);
    };

    const onMsgClickHandler = (e) => {
        e.preventDefault();
        const newGoalList = memoData.get(currentDate);
        setMemoData((prev) =>
            new Map(prev).set(currentDate, [
                ...newGoalList,
                { msg: goalMsg, status: false },
            ])
        );
        setGoalMsg("");
    };

    const onChangeMsgHandler = (e) => {
        setGoalMsg(e.target.value);
    };

    const onCheckChange = (e) => {
        const checked = e.target.checked;
        const msg = e.target.dataset.msg;
        const currentGoalList = memoData.get(currentDate);
        const newGoal = currentGoalList.map((v) => {
            let temp = { ...v };
            if (v.msg === msg) {
                temp = { msg: v.msg, status: checked };
            }
            return temp;
        });
        setMemoData((prev) => new Map(prev).set(currentDate, [...newGoal]));
    };

    return (
        <div className={styles.memoContainer}>
            <div className={styles.memoWrap}>
                <nav className={styles.sidebar}>
                    <ul className={styles.dateList}>
                        {Array.from(memoData.keys()).map((v) => (
                            <li
                                className={styles.li}
                                key={v}
                                data-id={v}
                                onClick={onDateClick}
                            >
                                {v}
                            </li>
                        ))}
                    </ul>
                    <div className={styles.addWrap}>
                        <MdPlaylistAdd
                            size="30"
                            color="#edd200"
                            style={{ cursor: "pointer" }}
                            onClick={onAddDateHandler}
                        />
                    </div>
                </nav>
                <section className={styles.content}>
                    {memoData.size > 0 && (
                        <>
                            <ul className={styles.goals}>
                                {memoData.get(currentDate).map((v, i) => (
                                    <li key={`goal_${i}`}>
                                        <Goal
                                            id={`goal_${i}`}
                                            msg={v.msg}
                                            status={v.status}
                                            onCheckChange={onCheckChange}
                                        />
                                    </li>
                                ))}
                            </ul>
                            <Input
                                value={goalMsg}
                                onClick={onMsgClickHandler}
                                onChange={onChangeMsgHandler}
                            />
                        </>
                    )}
                </section>
            </div>
        </div>
    );
};

export default MainContainer;
