const express = require('express');
const cors = require('cors');

const { uuid, isUuid } = require('uuidv4');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function isValidId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) return response.status(400).json('Invalid Id.');

  return next();
}

function doesRepositoryExist(request, response, next) {
  const { id } = request.params;

  request.repositoryIndex = repositories.findIndex(
    (repository) => repository.id === id,
  );

  if (request.repositoryIndex >= 0) return next();

  return response.status(400).json('Repository not found.');
}

app.get('/repositories', (request, response) => {
  const { search } = request.params;

  if (search)
    return response
      .status(200)
      .json(
        repositories.filter(
          (repository) =>
            repository.title === search ||
            repository.techs.find((tech) => tech === search),
        ),
      );

  return response.status(200).json(repositories);
});

app.post('/repositories', (request, response) => {
  const { title, url, techs } = request.body;

  if (!title || !url || !techs)
    response.status(400).json({ error: 'Required params null or missing.' });

  const newRepository = { id: uuid(), title, url, techs, likes: 0 };
  repositories.push(newRepository);

  return response.status(201).json(newRepository);
});

app.put(
  '/repositories/:id',
  isValidId,
  doesRepositoryExist,
  (request, response) => {
    const repository = repositories[request.repositoryIndex];
    const { title, url, techs } = request.body;

    const updatedRepository = {
      ...repository,
      title: title ? title : repository.title,
      url: url ? url : repository.url,
      techs: techs ? techs : repository.techs,
    };

    repositories[request.repositoryIndex] = updatedRepository;

    return response.status(200).json(updatedRepository);
  },
);

app.delete(
  '/repositories/:id',
  isValidId,
  doesRepositoryExist,
  (request, response) => {
    const repositoryIndex = request.repositoryIndex;

    repositories.splice(repositoryIndex, 1);

    return response.status(204).send();
  },
);

app.post(
  '/repositories/:id/like',
  isValidId,
  doesRepositoryExist,
  (request, response) => {
    repositories[request.repositoryIndex].likes++;

    return response.status(200).json(repositories[request.repositoryIndex]);
  },
);

module.exports = app;
