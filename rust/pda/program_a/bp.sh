cargo build-sbf -- -Znext-lockfile-bump
solana program deploy ./target/sbf-solana-solana/release/program_a.so |tee pub.log

