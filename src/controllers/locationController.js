const Location = require('../models/locationModel');

const locationController = {
    // Get active locations (Public route)
    getActiveLocations: async (req, res) => {
        try {
            const locations = await Location.find({ isActive: true })
                .sort({ displayOrder: 1, city: 1 })
                .select('-__v');
            
            res.json({
                success: true,
                data: locations
            });
        } catch (error) {
            console.error('Error fetching active locations:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching locations',
                error: error.message
            });
        }
    },

    // Get all locations (Admin only)
    getAllLocations: async (req, res) => {
        try {
            const locations = await Location.find()
                .sort({ displayOrder: 1, city: 1 })
                .select('-__v');
            
            res.json({
                success: true,
                data: locations
            });
        } catch (error) {
            console.error('Error fetching all locations:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching locations',
                error: error.message
            });
        }
    },

    // Get location by ID
    getLocationById: async (req, res) => {
        try {
            const { id } = req.params;
            const location = await Location.findById(id).select('-__v');
            
            if (!location) {
                return res.status(404).json({
                    success: false,
                    message: 'Location not found'
                });
            }

            res.json({
                success: true,
                data: location
            });
        } catch (error) {
            console.error('Error fetching location:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching location',
                error: error.message
            });
        }
    },

    // Get locations by state
    getLocationsByState: async (req, res) => {
        try {
            const { state } = req.params;
            const locations = await Location.find({ state, isActive: true })
                .sort({ displayOrder: 1, city: 1 })
                .select('-__v');
            
            res.json({
                success: true,
                data: locations
            });
        } catch (error) {
            console.error('Error fetching locations by state:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching locations',
                error: error.message
            });
        }
    },

    // Create new location (Admin only)
    createLocation: async (req, res) => {
        try {
            const { city, district, state, icon, isActive, displayOrder, isNew } = req.body;

            // Validation
            if (!city || !district || !state) {
                return res.status(400).json({
                    success: false,
                    message: 'City, district, and state are required'
                });
            }

            const location = await Location.create({
                city,
                district,
                state,
                icon,
                isActive,
                displayOrder,
                isNew
            });

            res.status(201).json({
                success: true,
                message: 'Location created successfully',
                data: location
            });
        } catch (error) {
            console.error('Error creating location:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating location',
                error: error.message
            });
        }
    },

    // Update location (Admin only)
    updateLocation: async (req, res) => {
        try {
            const { id } = req.params;
            const { city, district, state, icon, isActive, displayOrder, isNew } = req.body;

            // Validation
            if (!city || !district || !state) {
                return res.status(400).json({
                    success: false,
                    message: 'City, district, and state are required'
                });
            }

            const location = await Location.findByIdAndUpdate(
                id,
                {
                    city,
                    district,
                    state,
                    icon,
                    isActive,
                    displayOrder,
                    isNew
                },
                { new: true, runValidators: true }
            );

            if (!location) {
                return res.status(404).json({
                    success: false,
                    message: 'Location not found'
                });
            }

            res.json({
                success: true,
                message: 'Location updated successfully',
                data: location
            });
        } catch (error) {
            console.error('Error updating location:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating location',
                error: error.message
            });
        }
    },

    // Delete location (Admin only)
    deleteLocation: async (req, res) => {
        try {
            const { id } = req.params;
            const location = await Location.findByIdAndDelete(id);

            if (!location) {
                return res.status(404).json({
                    success: false,
                    message: 'Location not found'
                });
            }

            res.json({
                success: true,
                message: 'Location deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting location:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting location',
                error: error.message
            });
        }
    },

    // Toggle location status (Admin only)
    toggleLocationStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const location = await Location.findById(id);

            if (!location) {
                return res.status(404).json({
                    success: false,
                    message: 'Location not found'
                });
            }

            location.isActive = !location.isActive;
            await location.save();

            res.json({
                success: true,
                message: 'Location status updated successfully',
                data: location
            });
        } catch (error) {
            console.error('Error toggling location status:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating location status',
                error: error.message
            });
        }
    },

    // Get unique states
    getStates: async (req, res) => {
        try {
            const states = await Location.distinct('state', { isActive: true });
            
            res.json({
                success: true,
                data: states.sort()
            });
        } catch (error) {
            console.error('Error fetching states:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching states',
                error: error.message
            });
        }
    }
};

module.exports = locationController;
