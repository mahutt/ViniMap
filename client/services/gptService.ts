import { Task } from '@/types';

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

export const generateMissingDurations = async (tasks: Task[]): Promise<void> => {
  const durationPromises = tasks
    .filter((task) => task.duration === null)
    .map(async (task) => {
      const duration = (await inferDuration(task.text)) ?? 0;
      task.duration = duration;
    });
  await Promise.all(durationPromises);
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
};
