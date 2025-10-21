const Talipapanatin = require("../model/Talipapanatin");
const { createLog } = require("../utils/logHelper");
const { LOGCONSTANTS } = require("../config/constants");
const Staff = require("../model/Staff");

const getAllProgram = async (req, res) => {
    try {
        const talipapanatin = await Talipapanatin.find({});
        return res.json(talipapanatin);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const postProgram = async (req, res) => {
    const { title, category, items } = req.body;

    try {
        if (!title || !category) {
            return res.status(400).json({ message: "Title and Category are required!" });
        }

        const programData = {
            title,
            category,
            items: items || []
        };

        const newProgram = await Talipapanatin.create(programData);

        // Create log for program creation
        await createLog({
            action: LOGCONSTANTS.actions.talipapanatin.CREATE_TALIPAPANATIN,
            category: LOGCONSTANTS.categories.TALIPAPANATIN,
            title: "New Talipapanatin Program Created",
            description: `Talipapanatin program "${title}" was created`,
            performedBy: req.userId,
            targetType: LOGCONSTANTS.targetTypes.TALIPAPANATIN,
            targetId: newProgram._id.toString(),
            targetName: title,
            details: { category, itemsCount: newProgram.items.length },
        });

        return res.status(201).json({
            message: "Program created successfully!",
            program: newProgram
        });
    } catch (error) {
        console.error("Error creating program:", error);

        return res.status(500).json({ error: error.message });
    }
};

const editProgram = async (req, res) => {
    const { id } = req.params;
    const { title, category } = req.body;

    try {
        if (!id) {
            return res.status(400).json({ message: "Program ID is required!" });
        }

        const program = await Talipapanatin.findById(id);

        if (!program) {
            return res.status(404).json({ message: "Program not found!" });
        }

        const updateData = {};
        if (title) updateData.title = title;
        if (category) updateData.category = category;

        const updatedProgram = await Talipapanatin.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        // Create log for program update
        await createLog({
            action: LOGCONSTANTS.actions.talipapanatin.UPDATE_TALIPAPANATIN,
            category: LOGCONSTANTS.categories.TALIPAPANATIN,
            title: "Talipapanatin Program Updated",
            description: `Talipapanatin program "${updatedProgram.title}" was updated`,
            performedBy: req.userId,
            targetType: LOGCONSTANTS.targetTypes.TALIPAPANATIN,
            targetId: updatedProgram._id.toString(),
            targetName: updatedProgram.title,
            details: updateData,
        });

        return res.status(200).json({
            message: "Program updated successfully!",
            program: updatedProgram
        });
    } catch (error) {
        console.error("Error updating program:", error);

        return res.status(500).json({ error: error.message });
    }
};

const deleteProgram = async (req, res) => {
    const { id } = req.params;

    try {
        if (!id) {
            return res.status(400).json({ message: "Program ID is required!" });
        }

        const program = await Talipapanatin.findById(id);

        if (!program) {
            return res.status(404).json({ message: "Program not found!" });
        }

        const programTitle = program.title;
        await Talipapanatin.findByIdAndDelete(id);

        // Create log for program deletion
        await createLog({
            action: LOGCONSTANTS.actions.talipapanatin.DELETE_TALIPAPANATIN,
            category: LOGCONSTANTS.categories.TALIPAPANATIN,
            title: "Talipapanatin Program Deleted",
            description: `Talipapanatin program "${programTitle}" was deleted`,
            performedBy: req.userId,
            targetType: LOGCONSTANTS.targetTypes.TALIPAPANATIN,
            targetId: id,
            targetName: programTitle,
        });

        return res.status(200).json({
            message: "Program deleted successfully!"
        });
    } catch (error) {
        console.error("Error deleting program:", error);

        return res.status(500).json({ error: error.message });
    }
};

const postProgramItem = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        if (!id) {
            return res.status(400).json({ message: "Program ID is required!" });
        }

        if (!name) {
            return res.status(400).json({ message: "Item name is required!" });
        }

        const program = await Talipapanatin.findById(id);

        if (!program) {
            return res.status(404).json({ message: "Program not found!" });
        }

        const newItem = { name };

        program.items.push(newItem);
        await program.save();

        // Create log for item addition
        await createLog({
            action: LOGCONSTANTS.actions.talipapanatin.UPDATE_TALIPAPANATIN,
            category: LOGCONSTANTS.categories.TALIPAPANATIN,
            title: "Item Added to Talipapanatin Program",
            description: `Item "${name}" was added to program "${program.title}"`,
            performedBy: req.userId,
            targetType: LOGCONSTANTS.targetTypes.TALIPAPANATIN,
            targetId: program._id.toString(),
            targetName: program.title,
            details: { 
                itemName: name,
                totalItems: program.items.length
            },
        });

        return res.status(201).json({ 
            message: "Item added successfully!",
            program
        });

    } catch (error) {
        console.error("Error adding program item:", error);
        return res.status(500).json({ error: error.message });
    }
};

const deleteProgramItem = async (req, res) => {
    const { id, itemId } = req.params;

    try {
        if (!id || !itemId) {
            return res.status(400).json({ message: "Program ID and Item ID are required!" });
        }

        const program = await Talipapanatin.findById(id);

        if (!program) {
            return res.status(404).json({ message: "Program not found!" });
        }

        const itemIndex = program.items.findIndex(
            item => item._id.toString() === itemId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item not found in this program!" });
        }

        const deletedItem = program.items[itemIndex];
        program.items.splice(itemIndex, 1);
        await program.save();

        // Create log for item deletion
        await createLog({
            action: LOGCONSTANTS.actions.talipapanatin.UPDATE_TALIPAPANATIN,
            category: LOGCONSTANTS.categories.TALIPAPANATIN,
            title: "Item Removed from Talipapanatin Program",
            description: `Item "${deletedItem.name}" was removed from program "${program.title}"`,
            performedBy: req.userId,
            targetType: LOGCONSTANTS.targetTypes.TALIPAPANATIN,
            targetId: program._id.toString(),
            targetName: program.title,
            details: { 
                itemName: deletedItem.name,
                itemId: deletedItem._id.toString(),
                totalItems: program.items.length
            },
        });

        return res.status(200).json({ 
            message: "Item deleted successfully!",
            program
        });

    } catch (error) {
        console.error("Error deleting program item:", error);
        return res.status(500).json({ error: error.message });
    }
};

const getProgramByTitle = async (req, res) => {
    const { title } = req.params;

    try {
        if (!title) {
            return res.status(400).json({ message: "Program title is required!" });
        }

        const program = await Talipapanatin.findOne({ 
            title: { $regex: title, $options: 'i' } 
        });

        if (!program) {
            return res.status(404).json({ message: "Program not found!" });
        }

        return res.json(program);
    } catch (error) {
        console.error("Error fetching program by title:", error);
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllProgram,
    postProgram,
    editProgram,
    deleteProgram,
    postProgramItem,
    deleteProgramItem,
    getProgramByTitle
}