import { CreditType } from "../models/CreditType.js";

const creidtcontroller = {

    getCreditTypes: async (req, res) => {
        try {
        const creditTypes = await CreditType.find().sort({ createdAt: -1 });
        res.status(200).json(creditTypes);
        } catch (error) {
        res.status(500).json({ error: error.message });
        }
    },
  // Get single credit type
    getCreditType: async (req, res) => {
        try {
        const { id } = req.params;
        const creditType = await CreditType.findById(id);
        if (!creditType) {
            return res.status(404).json({ message: "Credit type not found" });
        }
        res.status(200).json(creditType);
        } catch (error) {
        res.status(500).json({ error: error.message });
        }
    },
};
export default creidtcontroller;