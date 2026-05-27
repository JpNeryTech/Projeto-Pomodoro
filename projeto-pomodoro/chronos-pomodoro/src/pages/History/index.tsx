import { TrashIcon } from 'lucide-react';
import { Container } from '../../components/Container';
import { DefaultButton } from '../../components/DefaultButton';
import { Heading } from '../../components/Heading';
import { MainTemplate } from '../../templates/MainTemplate';

import styles from './styles.module.css';
import { useTaskContext } from '../../contexts/TaskContext/useTaskContext';
import { formatDate } from '../../utils/formatDate';
import { getTaskStatus } from '../../utils/getTaskStatus';
import { sortTasks, type SortTasksOptions } from '../../utils/sortTasks';
import { useEffect, useState } from 'react';
import { TaskActionTypes } from '../../contexts/TaskContext/taskActions';
import { showMessage } from '../../adapters/showMessage';
import { tasksAdapter } from '../../adapters/tasksAdapter';
import type { TaskModel } from '../../models/TaskModel';

export function History() {
  const { state, dispatch } = useTaskContext();
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);
  const [apiTasks, setApiTasks] = useState<TaskModel[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const [sortTasksOptions, setSortTaskOptions] = useState<SortTasksOptions>(
    () => {
      return {
        tasks: sortTasks({ tasks: [] }),
        field: 'startDate',
        direction: 'desc',
      };
    },
  );

  // Carrega tasks da API
  useEffect(() => {
    setIsLoadingHistory(true);
    tasksAdapter.getTasks()
      .then(tasks => {
        const parsed: TaskModel[] = tasks.map((t: any) => ({
          ...t,
          startDate: Number(t.startDate),
          completeDate: t.completeDate ? Number(t.completeDate) : null,
          interruptDate: t.interruptDate ? Number(t.interruptDate) : null,
        }));
        setApiTasks(parsed);
        setSortTaskOptions({
          tasks: sortTasks({ tasks: parsed, field: 'startDate', direction: 'desc' }),
          field: 'startDate',
          direction: 'desc',
        });
      })
      .catch(() => {
        setApiTasks(state.tasks);
      })
      .finally(() => setIsLoadingHistory(false));
  }, []);

  const hasTasks = apiTasks.length > 0;

  useEffect(() => {
    document.title = 'Histórico - Chronos Pomodoro';
  }, []);

  useEffect(() => {
    if (!confirmClearHistory) return;
    setConfirmClearHistory(false);

    tasksAdapter.deleteTasks()
      .then(() => {
        setApiTasks([]);
        setSortTaskOptions(prev => ({ ...prev, tasks: [] }));
        dispatch({ type: TaskActionTypes.RESET_STATE });
      })
      .catch(() => {
        showMessage.error('Erro ao limpar histórico');
      });
  }, [confirmClearHistory, dispatch]);

  useEffect(() => {
    return () => {
      showMessage.dismiss();
    };
  }, []);

  function handleSortTasks({ field }: Pick<SortTasksOptions, 'field'>) {
    const newDirection = sortTasksOptions.direction === 'desc' ? 'asc' : 'desc';

    setSortTaskOptions({
      tasks: sortTasks({
        direction: newDirection,
        tasks: sortTasksOptions.tasks,
        field,
      }),
      direction: newDirection,
      field,
    });
  }

  function handleResetHistory() {
    showMessage.dismiss();
    showMessage.confirm('Tem certeza?', confirmation => {
      setConfirmClearHistory(confirmation);
    });
  }

  return (
    <MainTemplate>
      <Container>
        <Heading>
          <span>History</span>
          {hasTasks && (
            <span className={styles.buttonContainer}>
              <DefaultButton
                icon={<TrashIcon />}
                color='red'
                aria-label='Apagar todo o histórico'
                title='Apagar histórico'
                onClick={handleResetHistory}
              />
            </span>
          )}
        </Heading>
      </Container>

      <Container>
        {isLoadingHistory && (
          <p style={{ textAlign: 'center' }}>Carregando histórico...</p>
        )}

        {!isLoadingHistory && hasTasks && (
          <div className={styles.responsiveTable}>
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSortTasks({ field: 'name' })} className={styles.thSort}>Tarefa ↕</th>
                  <th onClick={() => handleSortTasks({ field: 'duration' })} className={styles.thSort}>Duração ↕</th>
                  <th onClick={() => handleSortTasks({ field: 'startDate' })} className={styles.thSort}>Data ↕</th>
                  <th>Status</th>
                  <th>Tipo</th>
                </tr>
              </thead>
              <tbody>
                {sortTasksOptions.tasks.map(task => {
                  const taskTypeDictionary = {
                    workTime: 'Foco',
                    shortBreakTime: 'Descanso curto',
                    longBreakTime: 'Descanso longo',
                  };
                  return (
                    <tr key={task.id}>
                      <td>{task.name}</td>
                      <td>{task.duration}min</td>
                      <td>{formatDate(task.startDate)}</td>
                      <td>{getTaskStatus(task, state.activeTask)}</td>
                      <td>{taskTypeDictionary[task.type]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!isLoadingHistory && !hasTasks && (
          <p style={{ textAlign: 'center', fontWeight: 'bold' }}>
            Ainda não existem tarefas criadas.
          </p>
        )}
      </Container>
    </MainTemplate>
  );
}