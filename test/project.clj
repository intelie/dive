(defproject dive-test "0.1.0-SNAPSHOT"
  :description "Generative tests for Dive"
  :url "https://github.com/intelie/dive/tree/master/test"
  :license {:name "MIT"
            :url "http://opensource.org/licenses/MIT"}
  :plugins [[lein-cljsbuild "1.0.3"]
            [lein-npm "0.4.0"]
            [com.cemerick/clojurescript.test "0.3.0"]]
  :dependencies [[org.clojure/clojure "1.5.1"]]
  :hooks [leiningen.cljsbuild]
  :test-paths ["test"]
  :aliases {"cleantest" ["do" "clean," "cljsbuild" "once," "test,"]}
  :dependencies [[org.clojure/clojure "1.5.1"]
                 [org.clojure/clojurescript "0.0-2202"]
                 [com.cemerick/double-check "0.5.7-SNAPSHOT"]]
  :node-dependencies [[phantomjs "1.9.x"]]
  :cljsbuild {:builds [{:source-paths ["src" "test"]
                        :compiler {:libs [""]
                                   :output-to "target/cljs/dive_test.js"
                                   :optimizations :whitespace
                                   :pretty-print true}}]
              :test-commands {"unit-tests" ["phantomjs" :runner
                                            "target/cljs/dive_test.js"
                                            #_"js/dive.js"]}})
