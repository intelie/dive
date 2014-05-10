(ns dive-test.core-test
  (:require [cemerick.cljs.test :as test]
            [cemerick.double-check.clojure-test :as tc
             :include-macros true :refer [defspec]]
            [cemerick.double-check.generators :as gen]
            [cemerick.double-check.properties :as prop :include-macros true]))

(defspec sort-idempotent-prop 100
  (prop/for-all [v (gen/vector gen/int)]
    (= (sort v) (sort (sort v)))))
