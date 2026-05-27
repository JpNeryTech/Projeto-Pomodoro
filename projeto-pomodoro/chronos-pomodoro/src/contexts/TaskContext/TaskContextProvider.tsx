import { useEffect, useReducer, useRef } from 'react';
import { initialTaskState } from './initialTaskState';
import { taskReducer } from './taskReducer';
import { TaskContext } from './TaskContext';
import { TimerWorkerManager } from '../../workers/TimerWorkerManager';
import { TaskActionTypes } from './taskActions';
import { loadBeep } from '../../utils/loadBeep';
import type { TaskStateModel } from '../../models/TaskStateModel';
import { settingsAdapter } from '../../adapters/settingsAdapter';
import { tasksAdapter } from '../../adapters/tasksAdapter';

type TaskContextProviderProps = {
  children: React.ReactNode;
};

export function TaskContextProvider({ children }: TaskContextProviderProps) {
  const [state, dispatch] = useReducer(taskReducer, initialTaskState, () => {
    const storageState = localStorage.getItem('state');

    if (storageState === null) return initialTaskState;

    const parsedStorageState = JSON.parse(storageState) as TaskStateModel;

    return {
      ...parsedStorageState,
      activeTask: null,
      secondsRemaining: 0,
      formattedSecondsRemaining: '00:00',
    };
  });

  const playBeepRef = useRef<ReturnType<typeof loadBeep> | null>(null);
  const prevActiveTaskRef = useRef(state.activeTask);

  const worker = TimerWorkerManager.getInstance();

  // Carrega settings da API no startup
  useEffect(() => {
    settingsAdapter.getSettings().then(settings => {
      dispatch({
        type: TaskActionTypes.CHANGE_SETTINGS,
        payload: {
          workTime: settings.workTime,
          shortBreakTime: settings.shortBreakTime,
          longBreakTime: settings.longBreakTime,
        },
      });
    }).catch(() => {});
  }, []);

  useEffect(() => {
    worker.onmessage(e => {
      const countDownSeconds = e.data;

      if (countDownSeconds <= 0) {
        if (playBeepRef.current) {
          playBeepRef.current();
          playBeepRef.current = null;
        }

        // Completa a task na API
        if (prevActiveTaskRef.current) {
          tasksAdapter.completeTask(prevActiveTaskRef.current.id, Date.now()).catch(() => {});
        }

        dispatch({ type: TaskActionTypes.COMPLETE_TASK });
        worker.terminate();
      } else {
        dispatch({
          type: TaskActionTypes.COUNT_DOWN,
          payload: { secondsRemaining: countDownSeconds },
        });
      }
    });
  }, [worker]);

  useEffect(() => {
    localStorage.setItem('state', JSON.stringify(state));

    if (!state.activeTask) {
      worker.terminate();
    }

    document.title = `${state.formattedSecondsRemaining} - Chronos Pomodoro`;

    worker.postMessage(state);
  }, [worker, state]);

  useEffect(() => {
    if (state.activeTask && playBeepRef.current === null) {
      playBeepRef.current = loadBeep();
    } else {
      playBeepRef.current = null;
    }

    prevActiveTaskRef.current = state.activeTask;
  }, [state.activeTask]);

  return (
    <TaskContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
}