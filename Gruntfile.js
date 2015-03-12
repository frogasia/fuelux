/*jshint expr:true*/
/*global module:false */
module.exports = function (grunt) {

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-recess');

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
					'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
					'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
					'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
					' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n'
			},
			all: {
				files: {
					'dist/all.min.js': ['dist/all.js']
				}
			},
			loader: {
				files: {
					'dist/loader.min.js': ['dist/loader.js']
				}
			}
		},
		testUrls: ['1.9.1', '1.8.3', '1.7.2'].map(function (ver) {
			return 'http://localhost:<%= connect.server.options.port %>/test/fuelux.html?jquery=' + ver;
		}),
		qunit: {
			simple: ['test/**/*.html'],
			full: {
				options: {
					urls: '<%= testUrls %>'
				}
			}
		},
		watch: {
			files: ['Gruntfile.js', 'lib/**', 'src/**', 'test/**'],
			tasks: ['quicktest', 'quickcss']
		},
		connect: {
			server: {
				options: {
					port: 8000
				}
			}
		},
		jshint: {
			options: {
				curly: false,
				eqeqeq: true,
				immed: true,
				latedef: true,
				laxcomma: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				unused: true,
				boss: true,
				eqnull: true,
				browser: true,
				globals: {
					jQuery: true,
					define: true,
					require: true
				}
			},
			source: ['Gruntfile.js', 'src/**/*.js'],
			tests: {
				options: {
					undef: false,
					unused: false,
					latedef: false
				},
				files: {
					src: ['test/**/*.js']
				}
			}
		},
		requirejs: {
			combine: {
				options: {
					appDir: 'src',
					dir: 'dist/',
					baseUrl: './',
					optimize: 'none',
					optimizeCss: 'none',
					normalizeDirDefines: 'all',
					wrap: true,
					logLevel: 0,
					paths: {
						almond: '../lib/almond',
						bootstrap: '../lib/bootstrap/js',
						jquery: '../lib/jquery-1.9.1.min',
						fuelux: '../src/'
					},
					modules: [
						{
							name: 'fuelux/all'
							, exclude: [ 'jquery' ]
						}
						, {
							name: 'fuelux/loader'
							, exclude: [ 'jquery' ]
							, include: [ 'almond', 'fuelux/all' ]
						}
					]
				}
			}
		},
		recess: {
			compile: {
				src: ['src/less/fuelux.less'],
				dest: 'dist/css/fuelux.css',
				options: {
					compile: true
				}
			},
			compile_responsive: {
				src: ['src/less/fuelux-responsive.less'],
				dest: 'dist/css/fuelux-responsive.css',
				options: {
					compile: true
				}
			},
			compress: {
				src: ['src/less/fuelux.less'],
				dest: 'dist/css/fuelux.min.css',
				options: {
					compile: true,
					compress: true
				}
			},
			compress_responsive: {
				src: ['src/less/fuelux-responsive.less'],
				dest: 'dist/css/fuelux-responsive.min.css',
				options: {
					compile: true,
					compress: true
				}
			}
		},
		clean: {
			dist: ['dist/build.txt', 'dist/fuelux*.zip'],
			zipsrc: ['dist/fuelux']
		},
		copy: {
			images: {
				expand: true,
				cwd: 'lib/bootstrap/img/',
				src: ['**'],
				dest: 'dist/img/'
			},
			zipsrc: {
				expand: true,
				cwd: 'dist/',
				src: ['**'],
				dest: 'dist/fuelux/'
			}
		},
		compress: {
			zip: {
				options: {
					mode: 'zip',
					archive: 'dist/fuelux2-standalone.zip'
				},
				files: [
					{
						expand: true,
						cwd: 'dist/',
						src: ['fuelux/**']
					}
				]
			}
		}
	});

	grunt.registerTask('quicktest', ['jshint', 'qunit:simple']);
	grunt.registerTask('fulltest', ['connect', 'jshint', 'qunit:full']);
	grunt.registerTask('saucelabs', ['connect', 'jshint', 'saucelabs-qunit']);

	grunt.registerTask('quickcss', ['recess:compile', 'recess:compile_responsive']);
	grunt.registerTask('fullcss', ['quickcss', 'recess:compress', 'recess:compress_responsive']);

	grunt.registerTask('default', ['fulltest', 'requirejs', 'fullcss', 'copy:images', 'clean:dist', 'uglify', 'copy:zipsrc', 'compress', 'clean:zipsrc']);
	grunt.registerTask('devserver', ['quicktest', 'quickcss', 'connect', 'watch']);

	grunt.registerTask('travisci', 'Run appropriate test strategy for Travis CI', function () {
		grunt.task.run('fulltest');
	});

};
