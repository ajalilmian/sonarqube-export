const { Command, Option } = require('commander');
const Axios = require('axios');
const FormData = require('form-data');
const cliProgress = require('cli-progress');
const Papa = require('papaparse');
const fs = require('fs');
require('dotenv').config();

const axios = Axios.create({
  baseURL: process.env.SONARQUBE_URL,
});

function createProgressBar() {
  return new cliProgress.SingleBar(
    {
      clearOnComplete: true,
    },
    cliProgress.Presets.shades_classic
  );
}

function createUsername(name) {
  let ind = name.indexOf('@');
  return name
    .substr(0, ind < 0 ? name.length : ind)
    .split(/[\.\_\-]/)
    .join(' ');
}

function mergeMatching(data) {
  return data.reduce((acc, [name, email, count]) => {
    const index = acc.findIndex(([n]) => n === name);
    if (index !== -1) {
      acc[index][1] += ',' + email;
      acc[index][2] += count;
    } else {
      acc.push([name, email, count]);
    }
    return acc;
  }, []);
}

async function authenticate() {
  console.log('Authenticating with SonarQube');
  const formData = new FormData();
  formData.append('login', process.env.SONARQUBE_LOGIN);
  formData.append('password', process.env.SONARQUBE_PASSWORD);

  const response = await axios.post(`/authentication/login`, formData);
  axios.defaults.headers.cookie = response.headers['set-cookie'];
}

async function fetchAllAuthors() {
  console.log('Fetching list of available authors');
  const { data } = await axios.get(`/issues/authors?ps=100&p=1`);
  console.log(`${data.authors.length} authors found`);
  return data.authors;
}

async function fetchIssuesCount(
  issueType,
  author,
  projects = [],
  severities = []
) {
  const { data } = await axios.get(
    `/issues/search?types=${issueType}&author=${author}&componentKeys=${projects.join(
      ','
    )}&severities=${severities.join(',')}`
  );
  return [createUsername(author), author, data.total];
}

function writeCsv(data, filename) {
  const output = Papa.unparse(data);
  fs.writeFileSync(filename, output);
  console.log(`Data exported to ${filename}`);
}

const program = new Command();

program
  .name('sonarqube-export')
  .description('CLI tool to export data from SonarQube to CSV using WebAPI')
  .version('1.0.0');

program
  .command('bugs')
  .description('Export a CSV file that lists count of bugs by authors')
  .option('-p, --project <projects...>', 'only list bugs for specified project')
  .option('-a, --author <authors...>', 'only show specified authors')
  .addOption(
    new Option(
      '-s, --severity <severities...>',
      'only list bugs of specified severity'
    ).choices(['INFO', 'MINOR', 'MAJOR', 'CRITICAL', 'BLOCKER'])
  )
  .option('-f, --filename <name>', 'name of CSV file', 'bugs.csv')
  .option('--no-merge', 'disable merging of matching records')
  .action(async (options) => {
    await authenticate();
    let authors;
    if (options.author) {
      authors = options.author;
    } else {
      authors = await fetchAllAuthors();
    }
    const progressBar = createProgressBar();
    progressBar.start(authors.length, 0);
    const authorsPromise = authors.map((author) => {
      progressBar.increment();
      return fetchIssuesCount('BUG', author, options.project, options.severity);
    });
    let data = await Promise.all(authorsPromise);
    progressBar.stop();
    if(options.merge) {
      data = mergeMatching(data);
    }
    writeCsv(data, options.filename);
  });

program
  .command('smells')
  .description('Export a CSV file that lists count of code-smells by authors')
  .option(
    '-p, --project <projects...>',
    'only list code-smells for specified project'
  )
  .option('-a, --author <authors...>', 'only show specified authors')
  .addOption(
    new Option(
      '-s, --severity <severities...>',
      'only list code-smells of specified severity'
    ).choices(['INFO', 'MINOR', 'MAJOR', 'CRITICAL', 'BLOCKER'])
  )
  .option('-f, --filename <name>', 'name of CSV file', 'smells.csv')
  .option('--no-merge', 'disable merging of matching records')
  .action(async (options) => {
    await authenticate();
    let authors;
    if (options.author) {
      authors = options.author;
    } else {
      authors = await fetchAllAuthors();
    }
    const progressBar = createProgressBar();
    progressBar.start(authors.length, 0);
    const authorsPromise = authors.map((author) => {
      progressBar.increment();
      return fetchIssuesCount(
        'CODE_SMELL',
        author,
        options.project,
        options.severity
      );
    });
    let data = await Promise.all(authorsPromise);
    progressBar.stop();
    if(options.merge) {
      data = mergeMatching(data);
    }
    writeCsv(data, options.filename);
  });

program.parse();
