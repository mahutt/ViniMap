import { Location, Position, Task } from '@/types';
import googleService from './GoogleService';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY as string;

export const performToolCall = async (input: string, tool: any): Promise<any> => {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini-2024-07-18',
      input,
      tools: [tool],
    }),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.output[0].arguments) {
    return null;
  }

  return JSON.parse(data.output[0].arguments);
};

export const inferDuration = async (taskTitle: string): Promise<number | null> => {
  const prompt = `Please estimate and set the duration (in minutes) for this task, given the task title: ${taskTitle}. Ignore travel time.`;
  const args = await performToolCall(prompt, OPENAI_TOOLS.setDuration);
  return args?.duration ?? null;
};

export const inferLocation = async (
  taskTitle: string,
  bias: Position
): Promise<Location | null> => {
  // This tool call is consistently returning the task title as the location query.
  // const prompt = `Please find a location for this task based on the task title: "${taskTitle}".
  // For example, "Get coffee" should return "Coffee Shop" and "Go to the library" should return "Library".`;
  // const args = await performToolCall(prompt, OPENAI_TOOLS.queryLocation);
  // const query = (args?.location as string) ?? taskTitle;
  const query = taskTitle;
  return await googleService.findPlace(query, bias);
};

export const generateMissingDurations = async (tasks: Task[]): Promise<void> => {
  const durationPromises = tasks
    .filter((task) => task.duration === null)
    .map(async (task) => {
      const duration = (await inferDuration(task.text)) ?? 0;
      task.duration = duration;
    });
  await Promise.all(durationPromises);
};

export const generateMissingLocations = async (tasks: Task[], bias: Position): Promise<void> => {
  // Improvement: Average the locations of tasks with locations (together with the bias)
  // and use that as the bias for the tasks without locations.
  const locationPromises = tasks
    .filter((task) => task.location === null)
    .map(async (task) => {
      const location = await inferLocation(task.text, bias);
      task.location = location;
    });
  await Promise.all(locationPromises);
};

const OPENAI_TOOLS = {
  setDuration: {
    type: 'function',
    name: 'set_task_duration',
    description: 'Set the duration of a task',
    parameters: {
      type: 'object',
      properties: {
        duration: {
          type: 'number',
          description: 'Duration in minutes',
        },
      },
      required: ['duration'],
      additionalProperties: false,
    },
  },
  queryLocation: {
    type: 'function',
    name: 'query_task_location',
    description: 'Query a location for the task based on the task title',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'Location query based on the task title',
        },
      },
      required: ['location'],
      additionalProperties: false,
    },
  },
};
