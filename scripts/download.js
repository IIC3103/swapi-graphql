/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE-examples file in the root directory of this source tree.
 */

import { URL } from 'url';
import { Agent } from 'https';
import { existsSync, writeFileSync } from 'fs';
import fetch from 'isomorphic-fetch';

const resources = [
  'people',
  'starships',
  'vehicles',
  'species',
  'planets',
  'films',
];

const integraFilm = { 
  title: 'Taller de Integración',
  episode_id: 12,
  opening_crawl:
   'El final de semestre está al acecho. Los estudiantes luchan por sacar adelante\r\nlos últimos trabajos del semestre para salvar la nota\r\nincluyendo la tarea 3 de Taller de Integración...',
  director: 'El profesor',
  producer: 'Los ayudantes',
  release_date: '2019-06-16',
  characters: ['https://swapi.co/api/people/90/', 'https://swapi.co/api/people/91/'],
  planets:
   [],
  starships:
   ['https://swapi.co/api/starships/9/'],
  vehicles:
   [],
  species:
   ['https://swapi.co/api/species/1/'],
  created: '2014-12-12T11:26:24.656000Z',
  edited: '2017-04-19T10:57:29.544256Z',
  url: 'https://swapi.co/api/films/15/' 
};

const prof = { 
  name: 'El profesor',
  height: '183',
  mass: '80',
  hair_color: 'black',
  skin_color: 'light',
  eye_color: 'brown',
  birth_year: '28BBY',
  gender: 'male',
  homeworld: 'https://swapi.co/api/planets/1/',
  films: [ integraFilm.url ],
  species: [ 'https://swapi.co/api/species/1/' ],
  vehicles: [],
  starships: [ 'https://swapi.co/api/starships/9/' ],
  created: '2014-12-10T15:59:50.509000Z',
  edited: '2014-12-20T21:17:50.323000Z',
  url: 'https://swapi.co/api/people/90/' 
};

const a1 = { 
  name: 'El ayudante',
  height: '193',
  mass: '70',
  hair_color: 'black',
  skin_color: 'light',
  eye_color: 'brown',
  birth_year: '24BBY',
  gender: 'male',
  homeworld: 'https://swapi.co/api/planets/1/',
  films: [ integraFilm.url ],
  species: [ 'https://swapi.co/api/species/1/' ],
  vehicles: [],
  starships: [ 'https://swapi.co/api/starships/9/' ],
  created: '2014-12-10T15:59:50.509000Z',
  edited: '2014-12-20T21:17:50.323000Z',
  url: 'https://swapi.co/api/people/91/' 
}

function normalizeUrl(url) {
  return new URL(url).toString();
}

/**
 * Iterate through the resources, fetch from the URL, convert the results into
 * objects, then generate and print the cache.
 */
async function cacheResources() {
  const agent = new Agent({ keepAlive: true });
  const cache = {};

  for (const name of resources) {
    let url = `https://swapi.co/api/${name}/`;

    while (url != null) {
      console.error(url);
      const response = await fetch(url, { agent });
      const data = await response.json();

      if(name === 'films') {
        data.count+=1;
        data.results.push(integraFilm);
      } else if(name === 'people') {
        data.count+=2;

        if(!data.previous) {
          data.results.push(prof);
          data.results.push(a1);
        }
      }

      cache[normalizeUrl(url)] = data;
      for (const obj of data.results || []) {
        cache[normalizeUrl(obj.url)] = obj;
      }

      url = data.next;
    }
    
  }



  return cache;
}

const outfile = process.argv[2];
if (!outfile) {
  console.error('Missing ouput file!');
  process.exit(1);
}

if (!existsSync(outfile)) {
  console.log('Downloading cache...');

  cacheResources()
    .then(cache => {
      const data = JSON.stringify(cache, null, 2);
      writeFileSync(outfile, data, 'utf-8');
      console.log('Cached!');
    })
    .catch(function(err) {
      console.error(err);
      process.exit(1);
    });
}
