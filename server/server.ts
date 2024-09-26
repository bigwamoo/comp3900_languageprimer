import express, { Request, Response } from 'express';
import cors from 'cors';


// NOTE: you may modify these interfaces
interface Student {
  id: number;
  name: string;
}

interface GroupSummary {
  id: number;
  groupName: string;
  members: number[];
}

interface Group {
  id: number;
  groupName: string;
  members: Student[];
}

const app = express();
const port = 3902;

app.use(cors());
app.use(express.json());

//Initialises array of students
let students: Student[] = [
{ id: 1, name: 'Alice' },
{ id: 2, name: 'Bob' },
{ id: 3, name: 'Charlie' },
{ id: 4, name: 'David' },
{ id: 5, name: 'Eve' }
]

//Initialises groups
let groups: GroupSummary[] = [
    {
        id: 1,
        groupName: 'Group 1',
        members: [1, 2, 4],
    },
    {
        id: 2,
        groupName: 'Group 2',
        members: [3, 5],
    }
]

/**
 * Route to get all groups
 * @route GET /api/groups
 * @returns {Array} - Array of group objects
 */
app.get('/api/groups', (req: Request, res: Response) => {
  res.json(groups);
});

/**
 * Route to get all students
 * @route GET /api/students
 * @returns {Array} - Array of student objects
 */
app.get('/api/students', (req: Request, res: Response) => {
  res.json(students);
});

/**
 * Route to add a new group
 * @route POST /api/groups
 * @param {string} req.body.groupName - The name of the group
 * @param {Array} req.body.members - Array of member names
 * @returns {Object} - The created group object
 */
app.post('/api/groups', (req: Request, res: Response) => {
    //Stores name and member names from request, then creates newGroup object
    const {groupName, members} = req.body;

    //Here, we map the members' names to the corresponding student objects
    const memberIds = members.map((memberName: String) => {
        const student = students.find(s => s.name === memberName);
        //We can then return the studentid, or null if it wasnt found above.
        return student ? student.id : null; 
    });

    //We filter the members by memberId- invalidCheck will hold any invalid members.
    const invalidCheck = memberIds.filter((id: number) => id === null);
    //If any invalids, return 400
    if (invalidCheck.length > 0){
        return res.status(400).send("Invalid member input");
    }

    //Constructs the group object to be returned.
    const newGroup: GroupSummary = {
        id: groups.length + 1,
        groupName,
        members: memberIds as number[]
    };
    //Pushes to existing groups array, then sends response.
    groups.push(newGroup);
    res.json(newGroup);
});

/**
 * Route to delete a group by ID
 * @route DELETE /api/groups/:id
 * @param {number} req.params.id - The ID of the group to delete
 * @returns {void} - Empty response with status code 204
 */
app.delete('/api/groups/:id', (req: Request, res: Response) => {
    //Parses the required Id from request
    const targetId = parseInt(req.params.id);
    //Sets groups as all the values without the one given in targetId.
    groups = groups.filter(group => group.id !== targetId);
    res.sendStatus(204);
});

/**
 * Route to get a group by ID (for fetching group members)
 * @route GET /api/groups/:id
 * @param {number} req.params.id - The ID of the group to retrieve
 * @returns {Object} - The group object with member details
 */
app.get('/api/groups/:id', (req: Request, res: Response) => {
    //Parses the input id into an integer
    const groupId = parseInt(req.params.id);
    //Finds the first group that matches this id
    const group = groups.find(g => g.id === groupId);

    //If above line returns invalid, send error 404
    if (!group) {
        return res.status(404).send("Group not found");
    }

    //Based on the given group, this code accesses its members (note that
    //at this stage, the members are just Ids and not student objects)
    //and maps each memberId to a student object.
    //The last filter removes all undefined objects
    const groupMembers = group.members.map(memberId => {
        return students.find(s => s.id === memberId);
    }).filter(student => student !== undefined);

    //Builds the response object, ensuring to cast groupmembers as student
    const response = {
        id: group.id,
        groupName: group.groupName,
        members: groupMembers as Student[]
    }

    res.json(response);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
