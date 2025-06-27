const express = require('express');
const cors = require('cors');
const Project = require('./models/Project');
const Task = require('./models/Task');
const TeamMember = require('./models/TeamMember');

const app = express();


require('./connection')
app.use(cors());
app.use(express.json());


const handleError = (res, status, message) => {
  return res.status(status).send({ message });
};


app.post('/api/login', async (req, res) => {
  try {
    const { name, role, password } = req.body;
    const teamMember = await TeamMember.findOne({ name, role });
    if (!teamMember) return handleError(res, 401, 'Invalid name or role');
    if (teamMember.password !== password) return handleError(res, 401, 'Invalid password');
    res.send({ name: teamMember.name, role: teamMember.role });
  } catch (err) {
    handleError(res, 500, err.message);
  }
});

// Project API
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.send(projects);
  } catch (err) {
    handleError(res, 500, err.message);
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const project = new Project({
      title: req.body.title,
      description: req.body.description,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
    });
    const newProject = await project.save();
    res.status(201).send(newProject);
  } catch (err) {
    handleError(res, 400, err.message);
  }
});

app.put('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return handleError(res, 404, 'Project not found');
    await Project.findByIdAndUpdate(req.params.id, req.body);
    project.updatedAt = Date.now();
    await project.save();
    res.send(project);
  } catch (err) {
    handleError(res, 400, err.message);
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return handleError(res, 404, 'Project not found');
    await project.deleteOne();
    res.send({ message: 'Project deleted' });
  } catch (err) {
    handleError(res, 500, err.message);
  }
});

// Task api
app.get('/api/tasks', async (req, res) => {
  try {
    const query = {};
    if (req.query.project) query.project = req.query.project;
    if (req.query.assignedTo) {
      const teamMember = await TeamMember.findOne({ name: req.query.assignedTo });
      if (!teamMember) return handleError(res, 404, 'Team member not found');
      query.assignedTo = teamMember._id;
    }
    const tasks = await Task.find(query).populate('assignedTo').populate('project');
    res.send(tasks);
  } catch (err) {
    handleError(res, 500, err.message);
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const task = new Task({
      title: req.body.title,
      description: req.body.description,
      dueDate: req.body.dueDate,
      assignedTo: req.body.assignedTo,
      project: req.body.project,
      status: req.body.status || 'To Do',
    });
    const newTask = await task.save();
    res.status(201).send(newTask);
  } catch (err) {
    handleError(res, 400, err.message);
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return handleError(res, 404, 'Task not found');
    await Task.findByIdAndUpdate(req.params.id, req.body);
    await task.save();
    res.send(task);
  } catch (err) {
    handleError(res, 400, err.message);
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return handleError(res, 404, 'Task not found');
    await task.deleteOne();
    res.send({ message: 'Task deleted' });
  } catch (err) {
    handleError(res, 500, err.message);
  }
});

// Team Member API
app.get('/api/teammembers', async (req, res) => {
  try {
    const teamMembers = await TeamMember.find();
    res.send(teamMembers);
  } catch (err) {
    handleError(res, 500, err.message);
  }
});

app.post('/api/teammembers', async (req, res) => {
  try {
    const teamMember = new TeamMember({
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      password: req.body.password,
    });
    const newTeamMember = await teamMember.save();
    res.status(201).send(newTeamMember);
  } catch (err) {
    handleError(res, 400, err.message);
  }
});

app.put('/api/teammembers/:id', async (req, res) => {
  try {
    const updatedMember = await TeamMember.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } 
    );
    if (!updatedMember) return handleError(res, 404, 'Team member not found');
    res.send(updatedMember);
  } catch (err) {
    handleError(res, 400, err.message);
  }
});


app.delete('/api/teammembers/:id', async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    if (!teamMember) return handleError(res, 404, 'Team member not found');
    await teamMember.deleteOne();
    res.send({ message: 'Team member deleted' });
  } catch (err) {
    handleError(res, 500, err.message);
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));