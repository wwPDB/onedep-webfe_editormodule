module.exports = function(grunt) {

    // 1. All configuration goes here 
    grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),


	// Project configuration.
	uglify: {
            main: {
                files: [
                    {src: 'js/editor-main.js', dest: 'js/editor-main.min.js'},
                ],
            },
            fxn: {
                files: [
                    {src: 'js/editor-fxn-defs.js', dest: 'js/editor-fxn-defs.min.js'},
                ],
            },
            category: {
                files: [
                    {src: 'js/category.js', dest: 'js/category.min.js'},
                ],
            },
            custom_jeditable_types: {
                files: [
                    {src: 'js/custom-jeditable-input-types.js', dest: 'js/custom-jeditable-input-types.min.js'},
                ],
            },
	},

	watch: {
            main: {
                files: ['js/editor-main.js'],
                tasks: ['uglify:main'],
                options: {
                    spawn: false,
                },
            },
            fxn: {
                files: ['js/editor-fxn-defs.js'],
                tasks: ['uglify:fxn'],
                options: {
                    spawn: false,
                },
            },
            category: {
                files: ['js/category.js'],
                tasks: ['uglify:category'],
                options: {
                    spawn: false,
                },
            },
            custom_jeditable_types: {
                files: ['js/custom-jeditable-input-types.js'],
                tasks: ['uglify:custom_jeditable_types'],
                options: {
                    spawn: false,
                },
            }
	},

//	watch: {
//	    scripts: {
//		files: ['js/*.js', '!js/*.min.js'],
//		tasks: ['uglify'],
//		options: {
//		    spawn: false,
//		},
//	    } 
//	},

	jsbeautifier : {
	    files : ['js/editor-main.js', 'js/editor-fxn-defs.js',
		    'js/custom-jeditable-input-types.js'],
	},

	jshint: { 
	    // lint your project's server code
	    all: [ 'js/editor-main.js',
		   'js/editor-fxn-defs.js',
		   'js/category.js',
		   'js/custom-jeditable-input-types.js'
		 ]
	}
	
    });

    // 3. Where we tell Grunt we plan to use this plug-in.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks("grunt-jsbeautifier");
    grunt.loadNpmTasks('grunt-contrib-jshint');
    
    // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
    grunt.registerTask('default', ['uglify']);

};

