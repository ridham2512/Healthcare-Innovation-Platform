import React, { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import ColumnContainer from "./ColumnContainer";
import TaskCard from "./TaskCard";
import { IconPlus } from "@tabler/icons-react";

function KanbanBoard({ state }) {
  const defaultCols =
    state?.state?.columns?.map((col) => ({
      id: col?.id,
      title: col?.title,
    })) || [];

  const defaultTasks =
    state?.state?.tasks?.map((task) => ({
      id: task?.id,
      columnId: task?.columnId,
      content: task?.content,
    })) || [];

  const [columns, setColumns] = useState(defaultCols);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
  const [tasks, setTasks] = useState(defaultTasks);
  const [activeColumn, setActiveColumn] = useState(null);
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } })
  );

  function createTask(columnId) {
    const newTask = {
      id: generateId(),
      columnId,
      content: `Task ${tasks.length + 1}`,
    };
    setTasks((prev) => [...prev, newTask]);
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  function updateTask(id, content) {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, content } : task))
    );
  }

  function createNewColumn() {
    const newColumn = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };
    setColumns((prev) => [...prev, newColumn]);
  }

  function deleteColumn(id) {
    setColumns((prev) => prev.filter((col) => col.id !== id));
    setTasks((prev) => prev.filter((task) => task.columnId !== id));
  }

  function updateColumn(id, title) {
    setColumns((prev) =>
      prev.map((col) => (col.id === id ? { ...col, title } : col))
    );
  }

  function onDragStart(event) {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
    } else if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
    }
  }

  function onDragEnd(event) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const isActiveAColumn = active.data.current?.type === "Column";
    if (isActiveAColumn) {
      setColumns((cols) => {
        const activeIndex = cols.findIndex((col) => col.id === active.id);
        const overIndex = cols.findIndex((col) => col.id === over.id);
        return arrayMove(cols, activeIndex, overIndex);
      });
    } else {
      const isActiveATask = active.data.current?.type === "Task";
      const isOverATask = over.data.current?.type === "Task";

      if (isActiveATask && isOverATask) {
        setTasks((prev) => {
          const activeIndex = prev.findIndex((t) => t.id === active.id);
          const overIndex = prev.findIndex((t) => t.id === over.id);
          // Immutably update columnId if moving between columns
          let updated = [...prev];
          if (updated[activeIndex].columnId !== updated[overIndex].columnId) {
            updated = updated.map((t, i) =>
              i === activeIndex
                ? { ...t, columnId: updated[overIndex].columnId }
                : t
            );
            return arrayMove(updated, activeIndex, overIndex - 1);
          }
          return arrayMove(updated, activeIndex, overIndex);
        });
      } else if (isActiveATask) {
        // Dropped on a column directly
        setTasks((prev) => {
          const activeIndex = prev.findIndex((t) => t.id === active.id);
          return prev.map((t, i) =>
            i === activeIndex ? { ...t, columnId: over.id } : t
          );
        });
      }
    }
  }

  function onDragOver(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (isActiveATask && isOverATask) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === active.id);
        const overIndex = prev.findIndex((t) => t.id === over.id);
        let updated = [...prev];
        if (updated[activeIndex].columnId !== updated[overIndex].columnId) {
          updated = updated.map((t, i) =>
            i === activeIndex
              ? { ...t, columnId: updated[overIndex].columnId }
              : t
          );
          return arrayMove(updated, activeIndex, overIndex - 1);
        }
        return arrayMove(updated, activeIndex, overIndex);
      });
    } else if (isActiveATask) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === active.id);
        return prev.map((t, i) =>
          i === activeIndex ? { ...t, columnId: over.id } : t
        );
      });
    }
  }

  return (
    <div className="mt-5 min-h-screen w-full text-gray-800">
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="m-auto flex gap-4 overflow-x-auto pb-6">
          <div className="flex gap-4">
            <SortableContext items={columnsId}>
              {columns.map((col) => (
                <ColumnContainer
                  key={col.id}
                  column={col}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  tasks={tasks.filter((task) => task.columnId === col.id)}
                />
              ))}
            </SortableContext>
          </div>
          <button
            onClick={createNewColumn}
            className="flex h-[60px] w-[350px] min-w-[350px] cursor-pointer gap-2 items-center rounded-xl border-2 border-dashed border-gray-300 bg-white p-4 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition"
          >
            <IconPlus size={20} />
            Add Column
          </button>
        </div>

        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
                tasks={tasks.filter(
                  (task) => task.columnId === activeColumn.id
                )}
              />
            )}
            {activeTask && (
              <TaskCard
                task={activeTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
}

function generateId() {
  return Math.floor(Math.random() * 100000);
}

export default KanbanBoard;
