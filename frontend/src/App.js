import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import UserManagement from './components/UserManagement';
import ExcelUpload from './components/ExcelUpload';
import StudentDashboard from './components/StudentDashboard';
import ProjectList from './components/ProjectList';
import TeacherDashboard from './components/TeacherDashboard';
import ProjectManagement from './components/ProjectManagement';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Switch>
        <Route path="/" exact component={Login} />
        <ProtectedRoute path="/admin" roles={['admin']} component={AdminDashboard} />
        <ProtectedRoute path="/admin/user-management" roles={['admin']} component={UserManagement} />
        <ProtectedRoute path="/admin/excel-upload" roles={['admin']} component={ExcelUpload} />
        <ProtectedRoute path="/student" roles={['student']} component={StudentDashboard} />
        <ProtectedRoute path="/student/projects" roles={['student']} component={ProjectList} />
        <ProtectedRoute path="/teacher" roles={['teacher']} component={TeacherDashboard} />
        <ProtectedRoute path="/teacher/project-management" roles={['teacher']} component={ProjectManagement} />
      </Switch>
    </Router>
  );
};

export default App;