import { useState, useEffect } from 'react'
import Header from '../../components/Header'
import './dashboard.scss'
import Tabs from '../../components/Tabs'
import { MdKeyboardArrowDown } from 'react-icons/md'
import minus from '../../assets/icons/Shape-1.svg'
import plus from '../../assets/icons/Shape.svg'
import { toast } from 'react-toastify'
import { auth, db } from '../../services/firebaseConnection'
import {
    addDoc,
    collection,
    onSnapshot,
    query,
    orderBy,
    where
} from 'firebase/firestore'

export default function Dashboard() {
    const [day, setDay] = useState('Monday')
    const [user, setUser] = useState({})
    const [tasks, setTasks] = useState([])

    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ]

    const [description, setDescription] = useState('')
    const [addDayTask, setAddDayTask] = useState(getCurrentDay())
    const [time, setTime] = useState('00:00')

    useEffect(() => {
        async function loadTarefas() {
            const userData = JSON.parse(localStorage.getItem('@planner'))
            setUser(userData)

            if (userData) {
                const tarefaRef = collection(db, 'tasks')
                const q = query(tarefaRef, orderBy('hora', 'desc'), where('userUid', '==', userData?.uid))
                const unsub = onSnapshot(q, (snapshot) => {
                    let list = []

                    snapshot.forEach((doc) => {
                        list.push({
                            id: doc.id,
                            tarefa: doc.data().tarefa,
                            dia: doc.data().dia,
                            hora: doc.data().hora,
                            userUid: doc.data().userUid
                        })
                    })
                    setTasks(list)
                    console.log(list)
                })
            }
        }

        loadTarefas()
    }, [])

    function getCurrentDay() {
        const date = new Date()
        const dayWeek = date.getDay()
        return days[dayWeek - 1]
    }

    const generateTimeOptions = () => {
        const options = []

        for (let i = 0; i < 1440; i += 30) {
            const hours = Math.floor(i / 60).toString().padStart(2, '0')
            const minutes = (i % 60).toString().padStart(2, '0')
            const timeOption = `${hours}:${minutes}`

            options.push(<option key={timeOption} value={timeOption}>{timeOption}</option>)
        }
        return options;
    }

    async function handleRegisterTask(e) {
        e.preventDefault()
        if (description === '') {
            toast.error('Preencha os campos da tarefa!')
            return
        }

        await addDoc(collection(db, 'tasks'), {
            tarefa: description,
            dia: addDayTask,
            hora: time,
            userUid: user?.uid
        })
            .then(() => {
                toast.success('Tarefa registrada!')
                setDescription('')
                setAddDayTask(getCurrentDay())
                setTime('00:00')
            })
            .catch((error) => {
                console.log('Erro ao registrar tarefa' + error)
            })
    }

    return (
        <div>
            <Header />
            <div className='planner'>
                <form className='add-task-area' onSubmit={handleRegisterTask}>
                    <div className="inputs-area">
                        <input type="text" placeholder='Task or issue' value={description} onChange={(e) => setDescription(e.target.value)} />
                        <select id="day-week" onChange={(e) => setAddDayTask(e.target.value)} value={addDayTask}>
                            {days.map(day => (
                                <option value={day} key={day}>{day}</option>
                            ))}
                        </select><MdKeyboardArrowDown size={24} id='arrow-day' />
                        <select id="time" value={time} onChange={(e) => setTime(e.target.value)}>
                            {generateTimeOptions()}
                        </select><MdKeyboardArrowDown size={24} id='arrow-time' />
                    </div>
                    <div className="function-area">
                        <button id="add">
                            <img src={plus} alt="Mais" />
                            Add to calendar
                        </button>
                        <button id="remove">
                            <img src={minus} alt="Menos" />
                            Delete all
                        </button>
                    </div>
                </form>

                <Tabs onTabClick={(selectedDay) => setDay(selectedDay)} />
                <h1>Resto do Dashboard</h1>
                <h2>{day}</h2>
            </div>
        </div>
    )
}
