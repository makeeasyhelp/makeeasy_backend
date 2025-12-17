const Banner = require('../models/bannerModel');

const bannerController = {
    // Get active banners (Public route)
    getActiveBanners: async (req, res) => {
        try {
            const banners = await Banner.find({ isActive: true })
                .sort({ displayOrder: 1, createdAt: -1 })
                .select('-__v');
            
            res.json({
                success: true,
                data: banners
            });
        } catch (error) {
            console.error('Error fetching active banners:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching banners',
                error: error.message
            });
        }
    },

    // Get all banners (Admin only)
    getAllBanners: async (req, res) => {
        try {
            const banners = await Banner.find()
                .sort({ displayOrder: 1, createdAt: -1 })
                .select('-__v');
            
            res.json({
                success: true,
                data: banners
            });
        } catch (error) {
            console.error('Error fetching all banners:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching banners',
                error: error.message
            });
        }
    },

    // Get banner by ID
    getBannerById: async (req, res) => {
        try {
            const { id } = req.params;
            const banner = await Banner.findById(id).select('-__v');
            
            if (!banner) {
                return res.status(404).json({
                    success: false,
                    message: 'Banner not found'
                });
            }

            res.json({
                success: true,
                data: banner
            });
        } catch (error) {
            console.error('Error fetching banner:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching banner',
                error: error.message
            });
        }
    },

    // Create new banner (Admin only)
    createBanner: async (req, res) => {
        try {
            const { title, subtitle, description, image, link, buttonText, isActive, displayOrder } = req.body;

            // Validation
            if (!title || !image) {
                return res.status(400).json({
                    success: false,
                    message: 'Title and image are required'
                });
            }

            const banner = await Banner.create({
                title,
                subtitle,
                description,
                image,
                link,
                buttonText,
                isActive,
                displayOrder
            });

            res.status(201).json({
                success: true,
                message: 'Banner created successfully',
                data: banner
            });
        } catch (error) {
            console.error('Error creating banner:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating banner',
                error: error.message
            });
        }
    },

    // Update banner (Admin only)
    updateBanner: async (req, res) => {
        try {
            const { id } = req.params;
            const { title, subtitle, description, image, link, buttonText, isActive, displayOrder } = req.body;

            // Validation
            if (!title || !image) {
                return res.status(400).json({
                    success: false,
                    message: 'Title and image are required'
                });
            }

            const banner = await Banner.findByIdAndUpdate(
                id,
                {
                    title,
                    subtitle,
                    description,
                    image,
                    link,
                    buttonText,
                    isActive,
                    displayOrder
                },
                { new: true, runValidators: true }
            );

            if (!banner) {
                return res.status(404).json({
                    success: false,
                    message: 'Banner not found'
                });
            }

            res.json({
                success: true,
                message: 'Banner updated successfully',
                data: banner
            });
        } catch (error) {
            console.error('Error updating banner:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating banner',
                error: error.message
            });
        }
    },

    // Delete banner (Admin only)
    deleteBanner: async (req, res) => {
        try {
            const { id } = req.params;
            const banner = await Banner.findByIdAndDelete(id);

            if (!banner) {
                return res.status(404).json({
                    success: false,
                    message: 'Banner not found'
                });
            }

            res.json({
                success: true,
                message: 'Banner deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting banner:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting banner',
                error: error.message
            });
        }
    },

    // Toggle banner status (Admin only)
    toggleBannerStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const banner = await Banner.findById(id);

            if (!banner) {
                return res.status(404).json({
                    success: false,
                    message: 'Banner not found'
                });
            }

            banner.isActive = !banner.isActive;
            await banner.save();

            res.json({
                success: true,
                message: 'Banner status updated successfully',
                data: banner
            });
        } catch (error) {
            console.error('Error toggling banner status:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating banner status',
                error: error.message
            });
        }
    },

    // Update banner order (Admin only)
    updateBannerOrder: async (req, res) => {
        try {
            const { banners } = req.body; // Array of { id, displayOrder }

            if (!Array.isArray(banners)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid data format'
                });
            }

            // Update each banner's order
            const updatePromises = banners.map(banner =>
                Banner.findByIdAndUpdate(banner.id, { displayOrder: banner.displayOrder })
            );

            await Promise.all(updatePromises);

            res.json({
                success: true,
                message: 'Banner order updated successfully'
            });
        } catch (error) {
            console.error('Error updating banner order:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating banner order',
                error: error.message
            });
        }
    }
};

module.exports = bannerController;
