import { getEmployees } from "@/services/employee.service";
import { getIdeas } from "@/services/idea.service";
import { getTasks } from "@/services/task.service";
import TaskForm from "@/features/tasks/components/task-form";

export default async function AddTaskPage() {
    // Fetch all employees, ideas, and tasks for the form
    const { employees } = await getEmployees(1, 1000); // Get all employees
    const { ideas } = await getIdeas(1, 1000); // Get all ideas
    const { tasks } = await getTasks(1, 1000); // Get all tasks for parent selection

    // Transform to simpler format for the form
    const employeesList = employees.map(emp => ({
        id: emp.id,
        staffId: emp.staffId,
        firstName: emp.firstName,
        lastName: emp.lastName,
    }));

    const ideasList = ideas.map(idea => ({
        id: idea.id,
        title: idea.title,
    }));

    const tasksList = tasks.map(task => ({
        id: task.id,
        title: task.title,
    }));

    return <TaskForm employees={employeesList} ideas={ideasList} tasks={tasksList} />;
}
