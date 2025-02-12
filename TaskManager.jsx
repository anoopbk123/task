import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import FormModal from "../Components/FormModal";
import TaskCard from "../Components/TaskCard";
import GreenButton from "../Components/GreenButton";
import ConfirmationModal from "../Components/ConfirmationModal";
import EditTaskModal from "../Components/EditTaskModal";

export default function TaskManager() {
  const assignees = ["E1", "E2", "E3", "E4"];
  const [showFormModal, setShowFormModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [toDoList, setToDoList] = useState([]);
  const [inProgressList, setInProgressList] = useState([]);
  const [completedList, setCompletedList] = useState([]);
  const [inputError, setInputError] = useState(false);
  const [showDeleteModal, setDeleteModal] = useState(false);
  const [deleteTask, setDeleteTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [taskInput, setTaskInput] = useState({
    summary: "",
    assignee: "",
    issueType: "",
    deadlineDate: "",
    deadlineTime: "",
    description: "",
  });

  // ADD NEW TASK
  const handleAddTask = () => {
    if (Object.values(taskInput).filter((item) => item === "").length > 0) {
      setInputError(true);
      setTimeout(() => {
        setInputError(false);
      }, 5000);
    } else {
      setTasks((previousState) => {
        const date = new Date();
        return [
          ...previousState,
          {
            ...taskInput,
            time: `${date.getFullYear()}-${
              date.getMonth() + 1
            }-${date.getDate()}${"  "} ${date.getHours()}:${date.getMinutes()}`,
            id: tasks.length === 0 ? 0 : tasks[tasks.length - 1].id + 1,
            status: "backlog",
          },
        ];
      });
      setShowFormModal(false);
      setTaskInput({
        summary: "",
        assignee: "",
        issueType: "",
        deadlineDate: "",
        deadlineTime: "",
        description: "",
      });
    }
  };

  // Handle Drag and Drop
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = source.droppableId;
    const finish = destination.droppableId;

    if (start === finish) {
      // Moving within the same column
      const list = getList(start);
      const newTaskIds = Array.from(list);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, list[source.index]);

      if (start === "backlog") {
        setTasks(newTaskIds);
      } else if (start === "toDo") {
        setToDoList(newTaskIds);
      } else if (start === "inProgress") {
        setInProgressList(newTaskIds);
      } else if (start === "completed") {
        setCompletedList(newTaskIds);
      }
    } else {
      // Moving between columns
      const startList = getList(start);
      const finishList = getList(finish);

      const movedTask = startList[source.index];

      // Remove from the start list
      startList.splice(source.index, 1);

      // Add to the finish list
      finishList.splice(destination.index, 0, movedTask);

      // Update the status of the moved task
      movedTask.status = finish;

      // Update the state
      if (start === "backlog") {
        setTasks(startList);
      } else if (start === "toDo") {
        setToDoList(startList);
      } else if (start === "inProgress") {
        setInProgressList(startList);
      } else if (start === "completed") {
        setCompletedList(startList);
      }

      if (finish === "backlog") {
        setTasks(finishList);
      } else if (finish === "toDo") {
        setToDoList(finishList);
      } else if (finish === "inProgress") {
        setInProgressList(finishList);
      } else if (finish === "completed") {
        setCompletedList(finishList);
      }
    }
  };

  const getList = (status) => {
    switch (status) {
      case "backlog":
        return tasks;
      case "toDo":
        return toDoList;
      case "inProgress":
        return inProgressList;
      case "completed":
        return completedList;
      default:
        return [];
    }
  };

  // HANDLE DELETE TASK
  const handleDeleteTask = () => {
    if (deleteTask.status === 'backlog') {
      const newTasks = tasks.filter((task) => task.id !== deleteTask.id);
      setTasks(newTasks);
    } else if (deleteTask.status === 'toDo') {
      const newTasks = toDoList.filter((task) => task.id !== deleteTask.id);
      setToDoList(newTasks);
    } else if (deleteTask.status === 'inProgress') {
      const newTasks = inProgressList.filter((task) => task.id !== deleteTask.id);
      setInProgressList(newTasks);
    } else if (deleteTask.status === 'completed') {
      const newTasks = completedList.filter((task) => task.id !== deleteTask.id);
      setCompletedList(newTasks);
    }
    setDeleteModal(false);
  };

  // HANDLE SAVE EDIT
  const handleSaveEdit = () => {
    if (editTask.status === 'backlog') {
      const index = tasks.findIndex((task) => task.id === editTask.id);
      const updatedTasks = tasks.toSpliced(index, 1, editTask);
      setTasks(updatedTasks);
    } else if (editTask.status === 'toDo') {
      const index = toDoList.findIndex((task) => task.id === editTask.id);
      const updatedTasks = toDoList.toSpliced(index, 1, editTask);
      setToDoList(updatedTasks);
    } else if (editTask.status === 'inProgress') {
      const index = inProgressList.findIndex((task) => task.id === editTask.id);
      const updatedTasks = inProgressList.toSpliced(index, 1, editTask);
      setInProgressList(updatedTasks);
    } else if (editTask.status === 'completed') {
      const index = completedList.findIndex((task) => task.id === editTask.id);
      const updatedTasks = completedList.toSpliced(index, 1, editTask);
      setCompletedList(updatedTasks);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div
        className={`${
          showFormModal || editTask
            ? "pointer-events-none bg-gray-500 bg-opacity-50 backdrop-blur-lg"
            : ""
        } p-5 min-h-screen rounded-lg text-white`}
      >
        <div className="flex justify-between flex-wrap">
          <h1 className="p-2 text-xl">Task Manager</h1>
          <div>
            <GreenButton
              onClickBtn={() => {
                setShowFormModal(true);
              }}
            >
              Add new Task
            </GreenButton>
          </div>
        </div>

        {/* LIST */}
        <div>
          {(tasks.length !== 0 || inProgressList !== 0 || toDoList !== 0 || completedList !== 0) && (
            <div className="p-2">
              <div className="flex flex-wrap gap-3 justify-evenly">
                <Droppable droppableId="backlog">
                  {(provided) => (
                    <div
                      className="bg-gray-100"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <h2 className="bg-gray-300 p-2 text-black">Backlog</h2>
                      <div>
                        {tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <TaskCard
                                  setEditTask={setEditTask}
                                  task={task}
                                  onDelete={() => {
                                    setDeleteModal(true);
                                    setDeleteTask(task);
                                  }}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>

                <Droppable droppableId="toDo">
                  {(provided) => (
                    <div
                      className="bg-gray-100"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <h2 className="bg-gray-300 p-2 text-black">To Do</h2>
                      <div>
                        {toDoList.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <TaskCard
                                  task={task}
                                  onDelete={() => {
                                    setDeleteModal(true);
                                    setDeleteTask(task);
                                  }}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>

                <Droppable droppableId="inProgress">
                  {(provided) => (
                    <div
                      className="bg-gray-100"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <h2 className="bg-gray-300 p-2 text-black">In Progress</h2>
                      <div>
                        {inProgressList.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <TaskCard
                                  task={task}
                                  onDelete={() => {
                                    setDeleteModal(true);
                                    setDeleteTask(task);
                                  }}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>

                <Droppable droppableId="completed">
                  {(provided) => (
                    <div
                      className="bg-gray-100"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <h2 className="bg-gray-300 p-2 text-black">Completed</h2>
                      <div>
                        {completedList.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <TaskCard
                                  task={task}
                                  onDelete={() => {
                                    setDeleteModal(true);
                                    setDeleteTask(task);
                                  }}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          )}
        </div>

        {/* FORM */}
        {showFormModal && (
          <FormModal
            taskInput={taskInput}
            setTaskInput={setTaskInput}
            title="Add new Task"
            onCancel={() => {
              setShowFormModal(false);
            }}
            assignees={assignees}
            onSubmitForm={handleAddTask}
            inputError={inputError}
          />
        )}

        {/* DELETE MODAL */}
        {showDeleteModal && (
          <ConfirmationModal
            title="Are you sure to delete"
            onCancel={() => {
              setDeleteModal(false);
              setDeleteModal(null);
            }}
            onDelete={handleDeleteTask}
          />
        )}

        {/* EDIT MODAL */}
        {editTask && (
          <EditTaskModal
            task={editTask}
            setEditTask={setEditTask}
            assignees={assignees}
            handleSaveEdit={handleSaveEdit}
          />
        )}
      </div>
    </DragDropContext>
  );
}