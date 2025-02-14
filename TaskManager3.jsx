import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import FormModal from "../Components/FormModal";
import TaskCard from "../Components/TaskCard";
import GreenButton from "../Components/GreenButton";
import ConfirmationModal from "../Components/ConfirmationModal";
import EditTaskModal from "../Components/EditTaskModal";

export default function TaskManager() {
  const assignees = ["E1", "E2", "E3", "E4"];
  const [uniqueId, setUniqueId] = useState(0);
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

  const progressList = [
    { id: "backlog", list: tasks, title: "Backlog" },
    { id: "toDo", list: toDoList, title: "To Do" },
    { id: "inProgress", list: inProgressList, title: "In Progress" },
    { id: "completed", list: completedList, title: "Completed" },
  ];
  // console.log(progressList)

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
            id: uniqueId,
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
      setUniqueId((previousState) => previousState + 1);
    }
  };

  // HANDLE DRAG AND DROP
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    // console.log(result)

    // If dropped outside a droppable area
    if (!destination) {
      // console.log("Dropped outside");
      return;
    }
    // console.log(`From: ${source.droppableId} to ${destination.droppableId}`);
    // If dropped in the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startColumn = progressList.find(
      (col) => col.id === source.droppableId
    );
    const finishColumn = progressList.find(
      (col) => col.id === destination.droppableId
    );

    // If moving within the same column
    if (startColumn === finishColumn) {
      const newList = Array.from(startColumn.list);
      const [removed] = newList.splice(source.index, 1);
      newList.splice(destination.index, 0, removed);

      // Update the state based on the column
      if (startColumn.id === "backlog") {
        setTasks(newList);
      } else if (startColumn.id === "toDo") {
        setToDoList(newList);
      } else if (startColumn.id === "inProgress") {
        setInProgressList(newList);
      } else if (startColumn.id === "completed") {
        setCompletedList(newList);
      }
    } else {
      // Moving between columns
      const startList = Array.from(startColumn.list);
      const [removed] = startList.splice(source.index, 1);
      removed.status = finishColumn.id; // Update the task status

      const finishList = Array.from(finishColumn.list);
      finishList.splice(destination.index, 0, removed);

      // Update the state for both columns
      if (startColumn.id === "backlog") {
        setTasks(startList);
      } else if (startColumn.id === "toDo") {
        setToDoList(startList);
      } else if (startColumn.id === "inProgress") {
        setInProgressList(startList);
      } else if (startColumn.id === "completed") {
        setCompletedList(startList);
      }

      if (finishColumn.id === "backlog") {
        setTasks(finishList);
      } else if (finishColumn.id === "toDo") {
        setToDoList(finishList);
      } else if (finishColumn.id === "inProgress") {
        setInProgressList(finishList);
      } else if (finishColumn.id === "completed") {
        setCompletedList(finishList);
      }
    }
  };

  // HANDLE DELETE TASK
  const handleDeleteTask = () => {
    if (deleteTask.status === "backlog") {
      const newTasks = tasks.filter((task) => task.id !== deleteTask.id);
      setTasks(newTasks);
    } else if (deleteTask.status === "toDo") {
      const newTasks = toDoList.filter((task) => task.id !== deleteTask.id);
      setToDoList(newTasks);
    } else if (deleteTask.status === "inProgress") {
      const newTasks = inProgressList.filter((task) => task.id !== deleteTask.id);
      setInProgressList(newTasks);
    } else if (deleteTask.status === "completed") {
      const newTasks = completedList.filter((task) => task.id !== deleteTask.id);
      setCompletedList(newTasks);
    }
    setDeleteModal(false);
  };

  // HANDLE SAVE EDIT
  const handleSaveEdit = () => {
    if (editTask.status === "backlog") {
      const index = tasks.findIndex((task) => task.id === editTask.id);
      const updatedTasks = tasks.toSpliced(index, 1, editTask);
      setTasks(updatedTasks);
    } else if (editTask.status === "toDo") {
      const index = toDoList.findIndex((task) => task.id === editTask.id);
      const updatedTasks = toDoList.toSpliced(index, 1, editTask);
      setToDoList(updatedTasks);
    } else if (editTask.status === "inProgress") {
      const index = inProgressList.findIndex((task) => task.id === editTask.id);
      const updatedTasks = inProgressList.toSpliced(index, 1, editTask);
      setInProgressList(updatedTasks);
    } else if (editTask.status === "completed") {
      const index = completedList.findIndex((task) => task.id === editTask.id);
      const updatedTasks = completedList.toSpliced(index, 1, editTask);
      setCompletedList(updatedTasks);
    }
  };

    //UPDATE TASK STATUS
    const handleUpdateStatus = (task) => {
      if (task.status === "backlog") {
        const updatedTask = {
          ...task,
          status: "toDo",
        };
        const updatedTasks = tasks.filter((item) => {
          return item.id !== task.id;
        });
        setTasks(updatedTasks);
        setToDoList((previousState) => {
          return [...previousState, updatedTask];
        });
      } else if (task.status === "toDo") {
        const updatedTask = {
          ...task,
          status: "inProgress",
        };
        const updatedTasks = toDoList.filter((item) => {
          return item.id !== task.id;
        });
        setToDoList(updatedTasks);
        setInProgressList((previousState) => {
          return [...previousState, updatedTask];
        });
      } else {
        const updatedTask = {
          ...task,
          status: "completed",
        };
        const updatedTasks = inProgressList.filter((item) => {
          return item.id !== task.id;
        });
        setInProgressList(updatedTasks);
        setCompletedList((previousState) => {
          return [...previousState, updatedTask];
        });
      }
  
      // if (updatedTask.status === "To Do") {
      //   updatedTask.status = "In Progress";
      // } else {
      //   updatedTask.status = "Completed";
      // }
      // const index = tasks.findIndex((task) => task.id === updatedTask.id);
      // const updatedTasks = tasks.toSpliced(index, 1, updatedTask);
      // setTasks(updatedTasks);
    };

    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <div
          className={`${
            showFormModal || editTask
              ? "pointer-events-none bg-gray-500 bg-opacity-50 backdrop-blur-lg"
              : ""
          } p-5 h-screen rounded-lg text-white max-w-screen flex flex-col`}
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
          <div className="max-w-full p-2 overflow-auto grow">
            <div className="flex gap-3 justify-evenly min-h-full">
              {progressList.map((column) => (
                <Droppable key={column.id} droppableId={column.id}>
                  {(provided) => {
                    // console.log(column.id)
                    return (
                    
                      <div
                        className="bg-[#262626] w-[368px] text-white rounded-[16px] shadow-2xl p-[24px] shrink-0 min-h-full"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        <h2 className="mb-4 text-[37px] font-bold">{column.title}</h2>
                        <div className="flex flex-col gap-2 min-h-full">
                          {column.list.map((task, index) => (
                            <Draggable
                              key={task.id}
                              draggableId={task.id.toString()}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <TaskCard
                                    updateFunction={handleUpdateStatus}
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
                    )
                  }}
                </Droppable>
              ))}
            </div>
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