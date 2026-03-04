import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../data');

const DB = {
  users: [],
  projects: [],
  exports: [],
  teams: []
};

function ensureDataDir() {
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
  }
}

function load(collection) {
  ensureDataDir();
  const filePath = path.join(dbPath, `${collection}.json`);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }
  return [];
}

function save(collection, data) {
  ensureDataDir();
  const filePath = path.join(dbPath, `${collection}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export const db = {
  users: {
    findOne: async (query) => {
      const users = load('users');
      return users.find(u => 
        Object.keys(query).every(key => u[key] === query[key])
      ) || null;
    },
    find: async (query = {}) => {
      const users = load('users');
      if (Object.keys(query).length === 0) return users;
      return users.filter(u => 
        Object.keys(query).every(key => u[key] === query[key])
      );
    },
    insertOne: async (doc) => {
      const users = load('users');
      doc._id = Date.now().toString();
      doc.createdAt = new Date().toISOString();
      doc.updatedAt = new Date().toISOString();
      users.push(doc);
      save('users', users);
      return doc;
    },
    updateOne: async (query, update) => {
      const users = load('users');
      const index = users.findIndex(u => 
        Object.keys(query).every(key => u[key] === query[key])
      );
      if (index !== -1) {
        users[index] = { ...users[index], ...update, updatedAt: new Date().toISOString() };
        save('users', users);
        return users[index];
      }
      return null;
    },
    deleteOne: async (query) => {
      const users = load('users');
      const index = users.findIndex(u => 
        Object.keys(query).every(key => u[key] === query[key])
      );
      if (index !== -1) {
        users.splice(index, 1);
        save('users', users);
        return true;
      }
      return false;
    }
  },
  projects: {
    find: async (query = {}) => {
      const projects = load('projects');
      if (Object.keys(query).length === 0) return projects;
      return projects.filter(p => 
        Object.keys(query).every(key => p[key] === query[key])
      );
    },
    insertOne: async (doc) => {
      const projects = load('projects');
      doc._id = Date.now().toString();
      doc.createdAt = new Date().toISOString();
      doc.updatedAt = new Date().toISOString();
      projects.push(doc);
      save('projects', projects);
      return doc;
    },
    updateOne: async (query, update) => {
      const projects = load('projects');
      const index = projects.findIndex(p => 
        Object.keys(query).every(key => p[key] === query[key])
      );
      if (index !== -1) {
        projects[index] = { ...projects[index], ...update, updatedAt: new Date().toISOString() };
        save('projects', projects);
        return projects[index];
      }
      return null;
    },
    deleteOne: async (query) => {
      const projects = load('projects');
      const index = projects.findIndex(p => 
        Object.keys(query).every(key => p[key] === query[key])
      );
      if (index !== -1) {
        projects.splice(index, 1);
        save('projects', projects);
        return true;
      }
      return false;
    }
  },
  exports: {
    find: async (query = {}) => {
      const exports = load('exports');
      if (Object.keys(query).length === 0) return exports;
      return exports.filter(e => 
        Object.keys(query).every(key => e[key] === query[key])
      );
    },
    insertOne: async (doc) => {
      const exports = load('exports');
      doc._id = Date.now().toString();
      doc.createdAt = new Date().toISOString();
      exports.push(doc);
      save('exports', exports);
      return doc;
    }
  }
};

export default db;
