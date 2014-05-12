(ns dive-test.core-test
  (:require [cemerick.cljs.test
             :include-macros true :refer [deftest is testing]]
            [cemerick.double-check.clojure-test :as tc
             :include-macros true :refer [defspec]]
            [cemerick.double-check.generators :as gen]
            [cemerick.double-check.properties :as prop :include-macros true]))

(deftest identity-test 10
  (is (= "hey" (js/Dive.identity "hey"))))

(defn roundtrip [f & args]
  (js->clj (apply f (map clj->js args))))

(defspec into-test 100
  (prop/for-all [dest (gen/map gen/string gen/boolean)
                 origin (gen/map gen/string gen/boolean)]
    (= (into dest origin)
       (roundtrip js/Dive.into dest origin))))
